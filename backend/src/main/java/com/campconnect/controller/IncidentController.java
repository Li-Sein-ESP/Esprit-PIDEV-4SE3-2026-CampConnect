package com.campconnect.controller;

import com.campconnect.dto.IncidentDTO;
import com.campconnect.service.IncidentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incidents")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class IncidentController {

    private final IncidentService incidentService;

    @PostMapping
    public ResponseEntity<IncidentDTO> createIncident(@RequestBody IncidentDTO incidentDTO) {
        return ResponseEntity.ok(incidentService.createIncident(incidentDTO));
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncidentDTO> getIncidentById(@PathVariable String id) {
        return ResponseEntity.ok(incidentService.getIncidentById(id));
    }

    @GetMapping("/trip/{tripId}")
    public ResponseEntity<List<IncidentDTO>> getIncidentsByTripId(@PathVariable String tripId) {
        return ResponseEntity.ok(incidentService.getIncidentsByTripId(tripId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIncident(@PathVariable String id) {
        incidentService.deleteIncident(id);
        return ResponseEntity.noContent().build();
    }
}
