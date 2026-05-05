package com.campconnect.service;
 
import com.campconnect.model.Reservation;
import com.campconnect.model.ReservationStatus;
import com.campconnect.model.User;
import com.campconnect.model.Campsite;
import com.campconnect.repository.ReservationRepository;
import com.campconnect.repository.UserRepository;
import com.campconnect.repository.CampsiteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;
 
import java.time.LocalDateTime;
import java.util.List;
 
@Service
public class ReservationServiceImpl implements IReservationService {
    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final CampsiteRepository campsiteRepository;
    private final NotificationService notificationService;
    private final MongoTemplate mongoTemplate;

    public ReservationServiceImpl(ReservationRepository reservationRepository, UserRepository userRepository, EmailService emailService, CampsiteRepository campsiteRepository, NotificationService notificationService, MongoTemplate mongoTemplate) {
        this.reservationRepository = reservationRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.campsiteRepository = campsiteRepository;
        this.notificationService = notificationService;
        this.mongoTemplate = mongoTemplate;
    }
 
    @Override
    public Reservation createReservation(Reservation reservation) {
        validateDates(reservation.getStartDate(), reservation.getEndDate());
 
        // Allow reservations starting today
        LocalDateTime todayStart = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        if (reservation.getStartDate().isBefore(todayStart)) {
            throw new IllegalArgumentException("Start date cannot be in the past");
        }

        // Verify user and campsite existence to prevent data inconsistency
        if (!userRepository.existsById(reservation.getUserId())) {
            throw new RuntimeException("User not found: " + reservation.getUserId());
        }
        if (!campsiteRepository.existsById(reservation.getTargetId())) {
            throw new RuntimeException("Campsite not found: " + reservation.getTargetId());
        }
 
        checkConflicts(reservation, null);
 
        reservation.setCreatedAt(LocalDateTime.now());
        reservation.setUpdatedAt(LocalDateTime.now());
        reservation.setStatus(ReservationStatus.PENDING);
 
        return reservationRepository.save(reservation);
    }
 
    private void validateDates(LocalDateTime start, LocalDateTime end) {
        if (end.isBefore(start)) {
            throw new IllegalArgumentException("End date must be after start date");
        }
    }
 
    private void checkConflicts(Reservation reservation, String excludeId) {
        if (reservation.getTargetId() == null) return;
        
        List<Reservation> existingReservations = reservationRepository.findByTargetId(reservation.getTargetId());
 
        for (Reservation r : existingReservations) {
            // Check if it's the same reservation we are currently updating
            if (excludeId != null && excludeId.equals(r.getId())) {
                continue;
            }
 
            if (r.getStatus() != ReservationStatus.CANCELLED && r.getStartDate() != null && r.getEndDate() != null) {
                boolean overlap = reservation.getStartDate().isBefore(r.getEndDate()) &&
                        reservation.getEndDate().isAfter(r.getStartDate());
 
                if (overlap) {
                    throw new IllegalStateException("Date conflict: campsite already booked for these dates");
                }
            }
        }
    }
 
    public List<Reservation> getUserReservations(String userId) {
        return reservationRepository.findByUserId(userId);
    }
 
    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }
 
    public Reservation getReservationById(String id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found with id: " + id));
 
    }
 
    @Override
    public Reservation updateReservation(String id, Reservation updatedReservation) {
        Reservation existingReservation = getReservationById(id);
 
        if (existingReservation.getStatus() == ReservationStatus.CONFIRMED ||
                existingReservation.getStatus() == ReservationStatus.COMPLETED) {
            throw new IllegalStateException("Cannot modify confirmed or completed reservation");
        }
 
        validateDates(updatedReservation.getStartDate(), updatedReservation.getEndDate());
 
        // Use the targetId from the update request, falling back to existing if not provided
        String targetId = updatedReservation.getTargetId() != null ? 
                         updatedReservation.getTargetId() : existingReservation.getTargetId();
 
        // Temporarily set data to check conflicts
        Reservation temp = new Reservation();
        temp.setTargetId(targetId);
        temp.setStartDate(updatedReservation.getStartDate());
        temp.setEndDate(updatedReservation.getEndDate());
        checkConflicts(temp, id);
 
        existingReservation.setTargetId(targetId);
        existingReservation.setStartDate(updatedReservation.getStartDate());
        existingReservation.setEndDate(updatedReservation.getEndDate());
        existingReservation.setUpdatedAt(LocalDateTime.now());
 
        return reservationRepository.save(existingReservation);
    }
 
    public Reservation cancelReservation(String id) {
        Reservation existingReservation = getReservationById(id);
 
        existingReservation.setStatus(ReservationStatus.CANCELLED);
        existingReservation.setUpdatedAt(LocalDateTime.now());
 
        return reservationRepository.save(existingReservation);
    }
 
    @Override
    public Reservation confirmReservation(String id) {
        System.out.println("Confirming reservation with ID: " + id);
        Reservation existingReservation = getReservationById(id);

        // Already confirmed — return as-is to avoid duplicate processing
        if (existingReservation.getStatus() == ReservationStatus.CONFIRMED) {
            System.out.println("Reservation " + id + " is already CONFIRMED.");
            return existingReservation;
        }

        // Atomic update: only update the status field directly in MongoDB
        Query query = new Query(Criteria.where("_id").is(id));
        Update update = new Update()
                .set("status", ReservationStatus.CONFIRMED)
                .set("updatedAt", LocalDateTime.now());
        mongoTemplate.updateFirst(query, update, Reservation.class);

        // Re-fetch the updated reservation to return the latest state
        Reservation savedReservation = getReservationById(id);
        System.out.println("Reservation saved as CONFIRMED. Status: " + savedReservation.getStatus());

        // Send confirmation email (non-blocking: exceptions are caught inside EmailService)
        userRepository.findById(savedReservation.getUserId()).ifPresentOrElse(user -> {
            if (user.getEmail() != null && !user.getEmail().isEmpty()) {
                String campsiteName = campsiteRepository.findById(savedReservation.getTargetId())
                        .map(Campsite::getName)
                        .orElse("Your Booked Site");

                emailService.sendReservationConfirmation(
                        user.getEmail(),
                        savedReservation.getId(),
                        user.getUsername(),
                        campsiteName,
                        savedReservation.getStartDate(),
                        savedReservation.getEndDate(),
                        savedReservation   // ← pass reservation for PDF attachment
                );

                notificationService.createNotification(
                    user.getId(),
                    "Réservation Confirmée !",
                    "Votre réservation pour " + campsiteName + " a été confirmée.",
                    com.campconnect.model.NotificationType.RESERVATION_CONFIRMED,
                    savedReservation.getId()
                );
            }
        }, () -> System.out.println("User not found for ID: " + savedReservation.getUserId()));

        return savedReservation;
    }
 
    public void deleteReservation(String id) {
        cancelReservation(id);
    }
}
