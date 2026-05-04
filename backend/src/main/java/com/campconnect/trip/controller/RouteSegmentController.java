package com.campconnect.trip.controller;

import com.campconnect.trip.dto.RouteSegmentDTO;
import com.campconnect.trip.entity.RouteSegment;
import com.campconnect.trip.service.IRouteSegmentService;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import java.util.List;

@RestController
@RequestMapping("/api/routesegments")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class RouteSegmentController {
    private final IRouteSegmentService service;

    @GetMapping
    public List<RouteSegment> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public RouteSegment getById(@PathVariable("id") String id) {
        return service.findById(id);
    }

    @GetMapping("/itinerary/{itineraryId}")
    public List<RouteSegment> getByItineraryId(@PathVariable("itineraryId") String itineraryId) {
        return service.findByItineraryId(itineraryId);
    }

    @PostMapping
    public RouteSegment create(@jakarta.validation.Valid @RequestBody RouteSegmentDTO dto) {
        return service.save(dto);
    }

    @PutMapping("/{id}")
    public RouteSegment update(@PathVariable("id") String id,
            @jakarta.validation.Valid @RequestBody RouteSegmentDTO dto) {
        return service.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable("id") String id) {
        service.delete(id);
    }

    @PostMapping("/{segmentId}/assign-itinerary/{itineraryId}")
    public void assignItinerary(@PathVariable("segmentId") String segmentId,
            @PathVariable("itineraryId") String itineraryId) {
        service.assignToItinerary(segmentId, itineraryId);
    }

    @PostMapping("/{segmentId}/assign-alert/{alertId}")
    public void assignAlert(@PathVariable("segmentId") String segmentId, @PathVariable("alertId") String alertId) {
        service.addAlertToSegment(segmentId, alertId);
    }
}
