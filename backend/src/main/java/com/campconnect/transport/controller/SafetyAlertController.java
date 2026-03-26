package com.campconnect.transport.controller;

import com.campconnect.transport.dto.SafetyAlertDTO;
import com.campconnect.transport.entity.SafetyAlert;
import com.campconnect.transport.service.ISafetyAlertService;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import java.util.List;

@RestController
@RequestMapping("/api/safetyalerts")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class SafetyAlertController {
    private final ISafetyAlertService service;

    @GetMapping
    public List<SafetyAlert> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public SafetyAlert getById(@PathVariable("id") String id) {
        return service.findById(id);
    }

    @PostMapping
    public SafetyAlert create(@jakarta.validation.Valid @RequestBody SafetyAlertDTO dto) {
        return service.save(dto);
    }

    @PutMapping("/{id}")
    public SafetyAlert update(@PathVariable("id") String id,
            @jakarta.validation.Valid @RequestBody SafetyAlertDTO dto) {
        return service.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable("id") String id) {
        service.delete(id);
    }

    @GetMapping("/route-segment/{segmentId}")
    public List<SafetyAlert> getByRouteSegmentId(@PathVariable("segmentId") String segmentId) {
        return service.findByRouteSegmentId(segmentId);
    }

    @PostMapping("/{alertId}/assign-segment/{segmentId}")
    public void assignSegment(@PathVariable("alertId") String alertId, @PathVariable("segmentId") String segmentId) {
        service.assignToSegment(alertId, segmentId);
    }
}
