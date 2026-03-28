package com.campconnect.trip.controller;

import com.campconnect.trip.dto.RouteOptimizationDTO;
import com.campconnect.trip.entity.RouteOptimization;
import com.campconnect.trip.service.IRouteOptimizationService;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import java.util.List;

@RestController
@RequestMapping("/api/optimizations")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class RouteOptimizationController {
    private final IRouteOptimizationService service;

    @GetMapping
    public List<RouteOptimization> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public RouteOptimization getById(@PathVariable("id") String id) {
        return service.findById(id);
    }

    @GetMapping("/trip/{tripId}")
    public RouteOptimization getByTripId(@PathVariable("tripId") String tripId) {
        return service.findByTripId(tripId);
    }

    @PostMapping
    public RouteOptimization create(@jakarta.validation.Valid @RequestBody RouteOptimizationDTO dto) {
        return service.save(dto);
    }

    @PutMapping("/{id}")
    public RouteOptimization update(@PathVariable("id") String id,
            @jakarta.validation.Valid @RequestBody RouteOptimizationDTO dto) {
        return service.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable("id") String id) {
        service.delete(id);
    }

    @PostMapping("/{id}/assign-trip/{tripId}")
    public void assignToTrip(@PathVariable("id") String id,
            @PathVariable("tripId") String tripId) {
        service.assignToTrip(id, tripId);
    }
}
