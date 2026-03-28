package com.campconnect.trip.controller;

import com.campconnect.trip.dto.PointOfInterestDTO;
import com.campconnect.trip.entity.PointOfInterest;
import com.campconnect.trip.service.IPointOfInterestService;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import java.util.List;

@RestController
@RequestMapping("/api/pointofinterests")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class PointOfInterestController {
    private final IPointOfInterestService service;

    @GetMapping
    public List<PointOfInterest> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public PointOfInterest getById(@PathVariable("id") String id) {
        return service.findById(id);
    }

    @GetMapping("/itinerary/{itineraryId}")
    public List<PointOfInterest> getByItineraryId(@PathVariable("itineraryId") String itineraryId) {
        return service.findByItineraryId(itineraryId);
    }

    @PostMapping
    public PointOfInterest create(@jakarta.validation.Valid @RequestBody PointOfInterestDTO dto) {
        return service.save(dto);
    }

    @PutMapping("/{id}")
    public PointOfInterest update(@PathVariable("id") String id,
            @jakarta.validation.Valid @RequestBody PointOfInterestDTO dto) {
        return service.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable("id") String id) {
        service.delete(id);
    }

    @PostMapping("/{poiId}/assign-itinerary/{itineraryId}")
    public void assignItinerary(@PathVariable("poiId") String poiId, @PathVariable("itineraryId") String itineraryId) {
        service.assignToItinerary(poiId, itineraryId);
    }
}
