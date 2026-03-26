package com.campconnect.trip.controller;

import com.campconnect.trip.dto.TripDTO;
import com.campconnect.trip.entity.Trip;
import com.campconnect.trip.service.ITripService;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import java.util.List;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class TripController {
    private final ITripService service;

    @GetMapping
    public List<Trip> getAll() {
        return service.findAll();
    }

    @GetMapping("/templates")
    public List<Trip> getTemplates() {
        return service.findTemplateTrips();
    }

    @GetMapping("/{id}")
    public Trip getById(@PathVariable("id") String id) {
        return service.findById(id);
    }

    @GetMapping("/user/{userId}")
    public List<Trip> getByUserId(@PathVariable("userId") String userId) {
        return service.findByUserId(userId);
    }

    @PostMapping
    public Trip create(@jakarta.validation.Valid @RequestBody TripDTO dto) {
        return service.save(dto);
    }

    @PutMapping("/{id}")
    public Trip update(@PathVariable("id") String id, @jakarta.validation.Valid @RequestBody TripDTO dto) {
        return service.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable("id") String id) {
        service.delete(id);
    }

    @PostMapping("/{tripId}/assign-transport/{transportId}")
    public void assignTransport(@PathVariable("tripId") String tripId,
            @PathVariable("transportId") String transportId) {
        service.addTransportToTrip(tripId, transportId);
    }

    @PostMapping("/{tripId}/assign-itinerary/{itineraryId}")
    public void assignItinerary(@PathVariable("tripId") String tripId,
            @PathVariable("itineraryId") String itineraryId) {
        service.addItineraryToTrip(tripId, itineraryId);
    }
}
