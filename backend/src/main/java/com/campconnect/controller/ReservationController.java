package com.campconnect.controller;

import com.campconnect.dto.ReservationRequest;
import com.campconnect.model.Reservation;
import com.campconnect.service.ReservationServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:4200", maxAge = 3600)
@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationServiceImpl reservationService;

    @PostMapping
    public ResponseEntity<Reservation> createReservation(@Valid @RequestBody ReservationRequest reservationDto) {
        Reservation reservation = new Reservation();
        reservation.setUserId(reservationDto.getUserId());
        reservation.setTargetId(reservationDto.getTargetId());
        reservation.setStartDate(reservationDto.getStartDate());
        reservation.setEndDate(reservationDto.getEndDate());
        Reservation createdReservation = reservationService.createReservation(reservation);
        return new ResponseEntity<>(createdReservation, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Reservation>> getAllReservations() {
        List<Reservation> reservations = reservationService.getAllReservations();
        return ResponseEntity.ok(reservations);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Reservation> getReservationById(@PathVariable("id") String id) {
        Reservation reservation = reservationService.getReservationById(id);
        return ResponseEntity.ok(reservation);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Reservation>> getUserReservations(@PathVariable("userId") String userId) {
        List<Reservation> reservations = reservationService.getUserReservations(userId);
        return ResponseEntity.ok(reservations);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Reservation> updateReservation(
            @PathVariable("id") String id,
            @Valid @RequestBody ReservationRequest reservationDto) {
        Reservation reservation = new Reservation();
        reservation.setUserId(reservationDto.getUserId());
        reservation.setTargetId(reservationDto.getTargetId());
        reservation.setStartDate(reservationDto.getStartDate());
        reservation.setEndDate(reservationDto.getEndDate());
        Reservation updatedReservation = reservationService.updateReservation(id, reservation);
        return ResponseEntity.ok(updatedReservation);
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Reservation> cancelReservation(@PathVariable("id") String id) {
        Reservation cancelledReservation = reservationService.cancelReservation(id);
        return ResponseEntity.ok(cancelledReservation);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Reservation> deleteReservation(@PathVariable("id") String id) {
        Reservation cancelledReservation = reservationService.cancelReservation(id);
        return ResponseEntity.ok(cancelledReservation);
    }
}
