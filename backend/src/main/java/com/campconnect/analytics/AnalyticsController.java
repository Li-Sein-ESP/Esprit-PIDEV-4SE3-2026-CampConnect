package com.campconnect.analytics;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsRepository analyticsRepository;

    /**
     * Requirement: Integration of complex JPQL consumption in the frontend.
     */
    @GetMapping("/high-impact")
    public ResponseEntity<List<CampsiteAudit>> getHighImpactAudits(
            @RequestParam String region,
            @RequestParam Double threshold) {
        return ResponseEntity.ok(analyticsRepository.findHighImpactAuditsByRegion(region, threshold));
    }

    /**
     * Requirement: Integration of complex Keywords consumption in the frontend.
     */
    @GetMapping("/search")
    public ResponseEntity<List<CampsiteAudit>> searchAudits(
            @RequestParam String name,
            @RequestParam Double minMultiplier) {
        return ResponseEntity.ok(analyticsRepository.findByCampsiteNameContainingAndTrends_MultiplierGreaterThan(name, minMultiplier));
    }

    @GetMapping("/all")
    public ResponseEntity<List<CampsiteAudit>> getAllAudits() {
        return ResponseEntity.ok(analyticsRepository.findAll());
    }
}
