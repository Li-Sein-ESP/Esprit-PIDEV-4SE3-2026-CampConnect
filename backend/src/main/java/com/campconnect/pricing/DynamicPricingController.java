package com.campconnect.pricing;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST endpoint for the Dynamic Pricing Engine.
 *
 * GET /api/pricing/{campsiteId}
 *   → Returns the full PricingFactors breakdown for that campsite.
 *      Public — no auth required (price discovery is public).
 */
@RestController
@RequestMapping("/api/pricing")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class DynamicPricingController {

    private final DynamicPricingService pricingService;

    /**
     * GET /api/pricing/{campsiteId}
     *
     * Returns a transparent pricing breakdown:
     *   - basePrice
     *   - Each multiplier (occupancy, season, weather, environmental)
     *   - Raw data behind each multiplier
     *   - Final dynamic price
     *   - Price direction (UP / DOWN / STABLE)
     */
    @GetMapping("/{campsiteId}")
    public ResponseEntity<PricingFactors> getDynamicPrice(@PathVariable String campsiteId) {
        try {
            PricingFactors factors = pricingService.computePrice(campsiteId);
            return ResponseEntity.ok(factors);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * GET /api/pricing/{campsiteId}/spatial-map
     *
     * Returns the virtual spatial map of the campsite with localized pitch prices.
     */
    @GetMapping("/{campsiteId}/spatial-map")
    public ResponseEntity<com.campconnect.pricing.dto.SpatialMapDTO> getSpatialMap(@PathVariable String campsiteId) {
        try {
            return ResponseEntity.ok(pricingService.generateSpatialMap(campsiteId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
