package com.campconnect.trip.controller;

import com.campconnect.trip.dto.TripItineraryDTO;
import com.campconnect.trip.entity.TripItinerary;
import com.campconnect.trip.service.ITripItineraryService;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import java.util.List;

@RestController
@RequestMapping("/api/itineraries")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class TripItineraryController {
    private final ITripItineraryService service;

    @GetMapping
    public List<TripItinerary> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public TripItinerary getById(@PathVariable("id") String id) {
        return service.findById(id);
    }

    @GetMapping("/trip/{tripId}")
    public List<TripItinerary> getByTripId(@PathVariable("tripId") String tripId) {
        return service.findByTripId(tripId);
    }

    @PostMapping
    public TripItinerary create(@jakarta.validation.Valid @RequestBody TripItineraryDTO dto) {
        return service.save(dto);
    }

    @PutMapping("/{id}")
    public TripItinerary update(@PathVariable("id") String id,
            @jakarta.validation.Valid @RequestBody TripItineraryDTO dto) {
        return service.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable("id") String id) {
        service.delete(id);
    }

    @PostMapping("/{itineraryId}/assign-activity/{activityId}")
    public void assignActivity(@PathVariable("itineraryId") String itineraryId,
            @PathVariable("activityId") String activityId) {
        service.addActivityToItinerary(itineraryId, activityId);
    }

    @PostMapping("/{itineraryId}/assign-poi/{poiId}")
    public void assignPoi(@PathVariable("itineraryId") String itineraryId, @PathVariable("poiId") String poiId) {
        service.addPoiToItinerary(itineraryId, poiId);
    }

    @PostMapping("/{itineraryId}/assign-segment/{segmentId}")
    public void assignSegment(@PathVariable("itineraryId") String itineraryId,
            @PathVariable("segmentId") String segmentId) {
        service.addSegmentToItinerary(itineraryId, segmentId);
    }
}
