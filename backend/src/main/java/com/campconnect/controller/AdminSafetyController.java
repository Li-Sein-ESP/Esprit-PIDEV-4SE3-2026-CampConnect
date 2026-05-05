package com.campconnect.controller;

import com.campconnect.dto.IncidentDTO;
import com.campconnect.dto.SafetyAlertDTO;
import com.campconnect.model.Incident;
import com.campconnect.model.SafetyAlert;
import com.campconnect.repository.IncidentRepository;
import com.campconnect.repository.SafetyAlertRepository;
import com.campconnect.service.IncidentService;
import com.campconnect.service.SafetyAlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/api/admin/safety")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(originPatterns = "*")
public class AdminSafetyController {

    private final SafetyAlertService safetyAlertService;
    private final IncidentService incidentService;
    private final SafetyAlertRepository safetyAlertRepository;
    private final IncidentRepository incidentRepository;

    @GetMapping("/alerts/pending")
    public ResponseEntity<List<SafetyAlertDTO>> getPendingAlerts() {
        List<SafetyAlertDTO> pending = safetyAlertRepository.findByStatus("PENDING")
                .stream()
                .map(this::toAlertDto)
                .toList();
        return ResponseEntity.ok(pending);
    }

    @PutMapping("/alerts/{id}/approve")
    public ResponseEntity<SafetyAlertDTO> approveAlert(@PathVariable String id) {
        SafetyAlertDTO dto = safetyAlertService.getAlertById(id);
        dto.setStatus("APPROVED");
        return ResponseEntity.ok(safetyAlertService.updateAlert(id, dto));
    }

    @PutMapping("/alerts/{id}/reject")
    public ResponseEntity<SafetyAlertDTO> rejectAlert(@PathVariable String id) {
        SafetyAlertDTO dto = safetyAlertService.getAlertById(id);
        dto.setStatus("REJECTED");
        return ResponseEntity.ok(safetyAlertService.updateAlert(id, dto));
    }

    @GetMapping("/incidents/pending")
    public ResponseEntity<List<IncidentDTO>> getPendingIncidents() {
        List<IncidentDTO> pending = incidentRepository.findByStatus("pending")
                .stream()
                .map(this::toIncidentDto)
                .toList();
        return ResponseEntity.ok(pending);
    }

    @PutMapping("/incidents/{id}/status")
    public ResponseEntity<IncidentDTO> updateIncidentStatus(
            @PathVariable String id,
            @RequestParam String status
    ) {
        IncidentDTO dto = new IncidentDTO();
        dto.setStatus(status.toLowerCase(Locale.ROOT));
        return ResponseEntity.ok(incidentService.updateIncident(id, dto));
    }

    private SafetyAlertDTO toAlertDto(SafetyAlert alert) {
        SafetyAlertDTO dto = new SafetyAlertDTO();
        dto.setId(alert.getId());
        dto.setTitle(alert.getTitle());
        dto.setDescription(alert.getDescription());
        dto.setType(alert.getType());
        dto.setSeverity(alert.getSeverity());
        dto.setStatus(alert.getStatus());
        dto.setLocationName(alert.getLocationName());
        dto.setRegionName(alert.getRegionName());
        dto.setCreatedAt(alert.getCreatedAt());
        if (alert.getTrip() != null) {
            dto.setTripId(alert.getTrip().getId());
        }
        return dto;
    }

    private IncidentDTO toIncidentDto(Incident incident) {
        IncidentDTO dto = new IncidentDTO();
        dto.setId(incident.getId());
        dto.setTitle(incident.getTitle());
        dto.setDescription(incident.getDescription());
        dto.setSeverity(incident.getSeverity());
        dto.setLevel(incident.getLevel());
        dto.setRegionName(incident.getRegionName());
        dto.setLatitude(incident.getLatitude());
        dto.setLongitude(incident.getLongitude());
        dto.setTripId(incident.getTripId());
        dto.setReporterId(incident.getReporterId());
        dto.setLocation(incident.getLocation());
        dto.setCreatedAt(incident.getCreatedAt());
        dto.setUpdatedAt(incident.getUpdatedAt());
        dto.setReportedAt(incident.getReportedAt());
        dto.setStatus(incident.getStatus());
        return dto;
    }
}
