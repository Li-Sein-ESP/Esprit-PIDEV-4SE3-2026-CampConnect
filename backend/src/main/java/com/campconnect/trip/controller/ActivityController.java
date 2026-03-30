package com.campconnect.trip.controller;

import com.campconnect.trip.dto.ActivityDTO;
import com.campconnect.trip.entity.Activity;
import com.campconnect.trip.service.IActivityService;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import java.util.List;

@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class ActivityController {
    private final IActivityService service;

    @GetMapping
    public List<Activity> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Activity getById(@PathVariable("id") String id) {
        return service.findById(id);
    }

    @GetMapping("/itinerary/{itineraryId}")
    public List<Activity> getByItineraryId(@PathVariable("itineraryId") String itineraryId) {
        return service.findByItineraryId(itineraryId);
    }

    @PostMapping
    public Activity create(@jakarta.validation.Valid @RequestBody ActivityDTO dto) {
        return service.save(dto);
    }

    @PutMapping("/{id}")
    public Activity update(@PathVariable("id") String id, @jakarta.validation.Valid @RequestBody ActivityDTO dto) {
        return service.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable("id") String id) {
        service.delete(id);
    }

    @PostMapping("/{activityId}/assign-itinerary/{itineraryId}")
    public void assignItinerary(@PathVariable("activityId") String activityId,
            @PathVariable("itineraryId") String itineraryId) {
        service.assignToItinerary(activityId, itineraryId);
    }
}
