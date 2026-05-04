package com.campconnect.gear.recommendation;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class GearRecommendationController {

    private final GearRecommendationService recommendationService;

    /**
     * Phase 1 — tells the camper what categories of gear they need.
     * ML prediction only, no database lookup.
     */
    @PostMapping("/gear/categories")
    public ResponseEntity<?> getCategories(@RequestBody GearRecommendationRequest request) {
        try {
            FlaskRecommendationResponse result = recommendationService.getCategories(request);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Phase 2 — returns actual gear items from the marketplace matching
     * the recommended categories. Called when the camper wants to browse / rent.
     */
    @PostMapping("/gear")
    public ResponseEntity<?> getMatchingItems(@RequestBody GearRecommendationRequest request) {
        try {
            GearRecommendationResult result = recommendationService.getMatchingItems(request);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        try {
            String healthResponse = recommendationService.checkFlaskHealth();
            return ResponseEntity.ok(healthResponse);
        } catch (RuntimeException e) {
            return ResponseEntity.status(503).body(
                    "{\"status\":\"unavailable\",\"error\":\"" + e.getMessage() + "\"}");
        }
    }
}
