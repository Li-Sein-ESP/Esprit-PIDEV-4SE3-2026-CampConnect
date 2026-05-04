package com.campconnect.controller;

import com.campconnect.dto.IncidentDTO;
import com.campconnect.service.IncidentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/incidents")
@RequiredArgsConstructor
@CrossOrigin(originPatterns = "*")
public class IncidentController {

    private final IncidentService incidentService;

    /**
     * POST /api/incidents - Create a new incident report
     */
    @PostMapping
    public ResponseEntity<?> createIncident(@RequestBody IncidentDTO IncidentDTO) {
        try {
            // Validate required fields
            if (IncidentDTO.getTitle() == null || IncidentDTO.getTitle().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Title is required",
                    "message", "Incident title/type is mandatory"
                ));
            }
            
            if (IncidentDTO.getDescription() == null || IncidentDTO.getDescription().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Description is required",
                    "message", "Detailed incident description is mandatory"
                ));
            }

            IncidentDTO created = incidentService.createIncident(IncidentDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Failed to create incident",
                "message", e.getMessage()
            ));
        }
    }

    /**
     * GET /api/incidents - Get all incident reports
     */
    @GetMapping
    public ResponseEntity<List<IncidentDTO>> getAllIncidents() {
        return ResponseEntity.ok(incidentService.getAllIncidents());
    }

    /**
     * GET /api/incidents/{id} - Get one incident by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getIncidentById(@PathVariable String id) {
        try {
            return ResponseEntity.ok(incidentService.getIncidentById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "error", "Incident not found",
                "id", id
            ));
        }
    }

    /**
     * GET /api/incidents/trip/{tripId} - Get incidents linked to a trip
     */
    @GetMapping("/trip/{tripId}")
    public ResponseEntity<List<IncidentDTO>> getByTrip(@PathVariable String tripId) {
        return ResponseEntity.ok(incidentService.getIncidentsByTripId(tripId));
    }

    /**
     * PUT /api/incidents/{id} - Update an existing incident
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateIncident(@PathVariable String id,
                                           @RequestBody IncidentDTO IncidentDTO) {
        try {
            return ResponseEntity.ok(incidentService.updateIncident(id, IncidentDTO));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "error", "Incident not found",
                "id", id
            ));
        }
    }

    /**
     * DELETE /api/incidents/{id} - Delete an incident
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteIncident(@PathVariable String id) {
        try {
            incidentService.deleteIncident(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "error", "Incident not found",
                "id", id
            ));
        }
    }
}
