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

        if (reservation.getEndDate().isBefore(reservation.getStartDate())) {
            throw new IllegalArgumentException("End date must be after start date");
        }

        if (reservation.getStartDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Start date must be in the future");
        }
        // Anti Double Booking Logic
        List<Reservation> existingReservations = reservationRepository.findByTargetId(reservation.getTargetId());

        for (Reservation r : existingReservations) {

            if (r.getStatus() != ReservationStatus.CANCELLED) {

                boolean overlap = reservation.getStartDate().isBefore(r.getEndDate()) &&
                        reservation.getEndDate().isAfter(r.getStartDate());

                if (overlap) {
                    throw new IllegalStateException("Date conflict: campsite already booked");
                }
            }
        }

        reservation.setCreatedAt(LocalDateTime.now());
        reservation.setUpdatedAt(LocalDateTime.now());
        reservation.setStatus(ReservationStatus.PENDING);

        return reservationRepository.save(reservation);
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

        // 🔥 Rule 1: Cannot modify confirmed or completed reservation
        if (existingReservation.getStatus() == ReservationStatus.CONFIRMED ||
                existingReservation.getStatus() == ReservationStatus.COMPLETED) {
            throw new IllegalStateException("Cannot modify confirmed or completed reservation");
        }

        if (updatedReservation.getEndDate().isBefore(updatedReservation.getStartDate())) {
            throw new IllegalArgumentException("End date must be after start date");
        }

        existingReservation.setStartDate(updatedReservation.getStartDate());
        existingReservation.setEndDate(updatedReservation.getEndDate());
        existingReservation.setTargetId(updatedReservation.getTargetId());
        existingReservation.setUpdatedAt(LocalDateTime.now());

        return reservationRepository.save(existingReservation);
    }

    public Reservation cancelReservation(String id) {
        Reservation existingReservation = getReservationById(id);

        existingReservation.setStatus(ReservationStatus.CANCELLED);
        existingReservation.setUpdatedAt(LocalDateTime.now());

        return reservationRepository.save(existingReservation);
    }
}
