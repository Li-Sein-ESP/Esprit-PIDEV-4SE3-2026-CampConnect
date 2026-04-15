package com.campconnect.controller;

import com.campconnect.model.User;

import com.campconnect.dto.TripDTO;
import com.campconnect.dto.ReservationDTO;
import com.campconnect.service.TripService;
import com.campconnect.service.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/trips")
public class TripsController {

    @Autowired
    private TripService tripService;

    @Autowired
    private ReservationService reservationService;

    @GetMapping
    public List<TripDTO> getAllTrips() {
        return tripService.getAllTrips();
    }

    @PostMapping
    public ResponseEntity<TripDTO> createTrip(@Valid @RequestBody TripDTO tripDTO) {
        return ResponseEntity.ok(tripService.createTrip(tripDTO));
    }

    @PostMapping("/{tripId}/reservations")
    public ResponseEntity<ReservationDTO> bookTrip(@PathVariable String tripId, @Valid @RequestBody ReservationDTO reservationDTO) {
        // Reservation logic would link to tripId and current user
        return ResponseEntity.ok(reservationService.createReservation(reservationDTO));
    }
}
