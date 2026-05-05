package com.campconnect.pricing;

import lombok.Builder;
import lombok.Data;

/**
 * Immutable DTO carrying the full pricing breakdown for a campsite.
 * Every factor is exposed so the frontend can render a transparent
 * price-explanation panel (no "magic number" pricing for the end user).
 */
@Data
@Builder
public class PricingFactors {

    // ── Base ───────────────────────────────────────────────────────────────
    private double basePrice;

    // ── Factor multipliers (around 1.0) ───────────────────────────────────
    private double occupancyMultiplier;
    private double seasonMultiplier;
    private double weatherMultiplier;
    private double environmentalMultiplier;

    // ── Raw data used (for transparency / audit) ───────────────────────────
    private double occupancyRate;          // 0.0 – 1.0
    private String seasonLabel;            // "High Season", "Low Season", …
    private double temperatureMax;         // °C
    private double precipitation;          // mm
    private int    activeEnvironmentalRules;
    private String worstSeverity;          // "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "NONE"

    // ── Final result ───────────────────────────────────────────────────────
    private double dynamicPrice;           // rounded to 2 decimals
    private double savingsOrSurcharge;     // positive = surcharge, negative = discount
    private String priceDirection;         // "UP", "DOWN", "STABLE"
}
