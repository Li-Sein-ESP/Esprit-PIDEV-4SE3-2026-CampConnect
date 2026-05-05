package com.campconnect.controller;

import com.campconnect.dto.OpenIncidentSummaryDTO;
import com.campconnect.dto.SchedulerImpactDTO;
import com.campconnect.model.Incident;
import com.campconnect.service.SafetyAnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/safety/analytics")
@CrossOrigin(originPatterns = "*")
@PreAuthorize("hasRole('ADMIN')")
public class SafetyAnalyticsController {

    private final SafetyAnalyticsService safetyAnalyticsService;

    public SafetyAnalyticsController(SafetyAnalyticsService safetyAnalyticsService) {
        this.safetyAnalyticsService = safetyAnalyticsService;
    }

    @GetMapping("/open-incidents-summary")
    public ResponseEntity<List<OpenIncidentSummaryDTO>> getOpenIncidentsSummary() {
        return ResponseEntity.ok(safetyAnalyticsService.getOpenIncidentSummary());
    }

    @GetMapping("/scheduler-impact")
    public ResponseEntity<SchedulerImpactDTO> getSchedulerImpact() {
        return ResponseEntity.ok(safetyAnalyticsService.getSchedulerImpact());
    }

    @GetMapping("/incidents/by-creator")
    public ResponseEntity<List<Incident>> getIncidentsByTripCreatorStatusAndSeverity(
            @RequestParam String creatorId,
            @RequestParam(defaultValue = "pending") String status,
            @RequestParam List<String> severities
    ) {
        return ResponseEntity.ok(
                safetyAnalyticsService.getIncidentsByTripCreatorStatusAndSeverity(creatorId, status, severities)
        );
    }
}
