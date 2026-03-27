package com.campconnect.service;

import com.campconnect.model.Reservation;
import com.campconnect.model.ReservationStatus;
import com.campconnect.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservationServiceImpl implements IReservationService {
    private final ReservationRepository reservationRepository;

    @Override
    public Reservation createReservation(Reservation reservation) {
        validateDates(reservation.getStartDate(), reservation.getEndDate());

        if (reservation.getStartDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Start date must be in the future");
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
        List<Reservation> existingReservations = reservationRepository.findByTargetId(reservation.getTargetId());

        for (Reservation r : existingReservations) {
            if (excludeId != null && r.getId().equals(excludeId))
                continue;

            if (r.getStatus() != ReservationStatus.CANCELLED) {
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

        // Temporarily set dates to check conflicts
        Reservation temp = new Reservation();
        temp.setTargetId(existingReservation.getTargetId());
        temp.setStartDate(updatedReservation.getStartDate());
        temp.setEndDate(updatedReservation.getEndDate());
        checkConflicts(temp, id);

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

    public void deleteReservation(String id) {
        cancelReservation(id);
    }
}
