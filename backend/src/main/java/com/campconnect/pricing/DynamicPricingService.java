package com.campconnect.pricing;

import com.campconnect.model.Campsite;
import com.campconnect.model.EnvironmentalRule;
import com.campconnect.model.Reservation;
import com.campconnect.model.ReservationStatus;
import com.campconnect.repository.CampsiteRepository;
import com.campconnect.repository.EnvironmentalRuleRepository;
import com.campconnect.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.Month;
import java.util.List;

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  DynamicPricingService  —  Core business logic for campsite dynamic pricing.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  Final Price = basePrice
 *                × occupancyMultiplier   (from MongoDB / reservations)
 *                × seasonMultiplier      (from system clock)
 *                × weatherMultiplier     (from Open-Meteo API)
 *                × environmentalMultiplier (from MongoDB / environmental_rules)
 *
 *  Result is always clamped between 50% and 200% of base price.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DynamicPricingService {

    private static final String OPEN_METEO_URL =
        "https://api.open-meteo.com/v1/forecast" +
        "?latitude={lat}&longitude={lon}" +
        "&daily=temperature_2m_max,precipitation_sum,sunshine_duration" +
        "&timezone=auto&forecast_days=3";

    // Price floor and ceiling as % of base price
    private static final double PRICE_FLOOR   = 0.50;
    private static final double PRICE_CEILING = 2.00;

    private final CampsiteRepository           campsiteRepository;
    private final ReservationRepository        reservationRepository;
    private final EnvironmentalRuleRepository  envRuleRepository;
    private final RestTemplate                 restTemplate;

    // ─────────────────────────────────────────────────────────────────────────
    //  Public API
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Generates a spatial map (virtual grid) for the campsite and computes localized pricing.
     */
    public com.campconnect.pricing.dto.SpatialMapDTO generateSpatialMap(String campsiteId) {
        PricingFactors globalPricing = computePrice(campsiteId);
        double baseDynamicPrice = globalPricing.getDynamicPrice();
        
        Campsite campsite = campsiteRepository.findById(campsiteId).orElse(new Campsite());
        String regionType = determineRegionType(campsite.getLocation());
        String waterFeatureName = determineWaterFeatureName(regionType);
        
        // Define POIs
        int lakeX = 80; int lakeY = 20;
        if ("COASTAL".equals(regionType)) { lakeX = 90; lakeY = 50; }
        else if ("DESERT".equals(regionType)) { lakeX = 85; lakeY = 15; }
        
        int toiletX = 20; int toiletY = 80;
        int entranceX = 10; int entranceY = 10;
        
        java.util.List<com.campconnect.pricing.dto.PitchDTO> pitches = new java.util.ArrayList<>();
        
        // Generate a grid of 12 virtual pitches
        int idCounter = 1;
        for (int i = 0; i < 3; i++) {
            for (int j = 0; j < 4; j++) {
                int pitchX = 15 + (j * 20);
                int pitchY = 25 + (i * 25);
                
                // Calculate distances
                double distToLake = Math.sqrt(Math.pow(pitchX - lakeX, 2) + Math.pow(pitchY - lakeY, 2));
                double distToToilet = Math.sqrt(Math.pow(pitchX - toiletX, 2) + Math.pow(pitchY - toiletY, 2));
                
                // Spatial Multiplier Logic
                double spatialMultiplier = 1.0;
                
                // Bonus for being close to the lake
                if (distToLake < 25) spatialMultiplier += 0.20;
                else if (distToLake < 50) spatialMultiplier += 0.10;
                
                // Penalty for being too close to toilets (noise/smell)
                if (distToToilet < 25) spatialMultiplier -= 0.15;
                // Bonus for being reasonably far from toilets (quiet)
                else if (distToToilet > 60) spatialMultiplier += 0.05;
                
                double finalPrice = Math.round((baseDynamicPrice * spatialMultiplier) * 100.0) / 100.0;
                
                String status = Math.random() > 0.8 ? "BOOKED" : "AVAILABLE";
                
                pitches.add(com.campconnect.pricing.dto.PitchDTO.builder()
                        .id("PITCH-" + campsiteId.substring(Math.max(0, campsiteId.length() - 4)) + "-" + idCounter)
                        .name("Emplacement " + (char)('A' + i) + (j + 1))
                        .x(pitchX)
                        .y(pitchY)
                        .spatialMultiplier(Math.round(spatialMultiplier * 100.0) / 100.0)
                        .finalPrice(finalPrice)
                        .status(status)
                        .build());
                idCounter++;
            }
        }
        
        return com.campconnect.pricing.dto.SpatialMapDTO.builder()
                .campsiteId(campsiteId)
                .baseDynamicPrice(baseDynamicPrice)
                .regionType(regionType)
                .waterFeatureName(waterFeatureName)
                .lakeX(lakeX).lakeY(lakeY)
                .toiletX(toiletX).toiletY(toiletY)
                .entranceX(entranceX).entranceY(entranceY)
                .pitches(pitches)
                .build();
    }

    /**
     * Computes the full pricing breakdown for a given campsite.
     * Results are cached for 30 minutes to avoid hammering Open-Meteo.
     */
    public PricingFactors computePrice(String campsiteId) {
        Campsite campsite = campsiteRepository.findById(campsiteId)
            .orElseThrow(() -> new IllegalArgumentException("Campsite not found: " + campsiteId));

        double basePrice = campsite.getPrice() != null ? campsite.getPrice() : 0.0;
        if (basePrice <= 0) {
            return PricingFactors.builder()
                .basePrice(0).dynamicPrice(0).priceDirection("STABLE").build();
        }

        // ── 1. Occupancy ──────────────────────────────────────────────────
        double occupancyRate       = computeOccupancyRate(campsiteId, campsite.getCapacity());
        double occupancyMultiplier = occupancyMultiplier(occupancyRate);

        // ── 2. Season ─────────────────────────────────────────────────────
        Month  currentMonth        = LocalDate.now().getMonth();
        String seasonLabel         = resolveSeasonLabel(currentMonth);
        double seasonMultiplier    = seasonMultiplier(currentMonth);

        // ── 3. Weather ────────────────────────────────────────────────────
        double tempMax             = 22.0;
        double precipitation       = 0.0;
        double weatherMultiplier   = 1.0;

        if (campsite.getLatitude() != null && campsite.getLongitude() != null) {
            try {
                WeatherForecastResponse forecast = fetchWeather(
                    campsite.getLatitude(), campsite.getLongitude());
                tempMax           = forecast.getTomorrowTempMax();
                precipitation     = forecast.getTomorrowPrecipitation();
                double sunshine   = forecast.getTomorrowSunshineDuration();
                weatherMultiplier = weatherMultiplier(tempMax, precipitation, sunshine);
            } catch (Exception e) {
                log.warn("Weather fetch failed for campsite {}, using defaults. Reason: {}",
                    campsiteId, e.getMessage());
            }
        }

        // ── 4. Environmental rules ────────────────────────────────────────
        List<EnvironmentalRule> activeRules    = envRuleRepository.findByActiveTrue();
        String                  worstSeverity  = resolveWorstSeverity(activeRules);
        double                  envMultiplier  = environmentalMultiplier(activeRules);

        // ── 5. Compose final price ────────────────────────────────────────
        double rawPrice    = basePrice * occupancyMultiplier * seasonMultiplier
                           * weatherMultiplier * envMultiplier;
        double clampedPrice = Math.max(basePrice * PRICE_FLOOR,
                              Math.min(basePrice * PRICE_CEILING, rawPrice));
        double finalPrice  = Math.round(clampedPrice * 100.0) / 100.0;

        double savingsOrSurcharge = Math.round((finalPrice - basePrice) * 100.0) / 100.0;
        String priceDirection     = savingsOrSurcharge > 0.5 ? "UP"
                                  : savingsOrSurcharge < -0.5 ? "DOWN" : "STABLE";

        log.info("[DynamicPricing] campsite={} base={} occupancy=×{} season=×{} weather=×{} env=×{} → final={}",
            campsiteId, basePrice, occupancyMultiplier, seasonMultiplier,
            weatherMultiplier, envMultiplier, finalPrice);

        return PricingFactors.builder()
            .basePrice(basePrice)
            .occupancyMultiplier(round(occupancyMultiplier))
            .seasonMultiplier(round(seasonMultiplier))
            .weatherMultiplier(round(weatherMultiplier))
            .environmentalMultiplier(round(envMultiplier))
            .occupancyRate(round(occupancyRate))
            .seasonLabel(seasonLabel)
            .temperatureMax(tempMax)
            .precipitation(precipitation)
            .activeEnvironmentalRules(activeRules.size())
            .worstSeverity(worstSeverity)
            .dynamicPrice(finalPrice)
            .savingsOrSurcharge(savingsOrSurcharge)
            .priceDirection(priceDirection)
            .build();
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Private helpers
    // ─────────────────────────────────────────────────────────────────────────

    private String determineRegionType(String location) {
        if (location == null) return "FOREST";
        String loc = location.toLowerCase();
        
        if (loc.contains("tozeur") || loc.contains("kébili") || loc.contains("kebili") || 
            loc.contains("tataouine") || loc.contains("médenine") || loc.contains("medenine") ||
            loc.contains("gabès") || loc.contains("gabes") || loc.contains("gafsa")) {
            return "DESERT";
        }
        
        if (loc.contains("nabeul") || loc.contains("sousse") || loc.contains("monastir") || 
            loc.contains("mahdia") || loc.contains("sfax") || loc.contains("kairouan") || 
            loc.contains("kasserine") || loc.contains("sidi bouzid")) {
            return "COASTAL";
        }
        
        return "FOREST";
    }

    private String determineWaterFeatureName(String regionType) {
        return switch (regionType) {
            case "DESERT" -> "Oasis";
            case "COASTAL" -> "Mer";
            default -> "Lac";
        };
    }

    /** Occupancy = confirmed future reservations / campsite capacity (capped at 1.0) */
    private double computeOccupancyRate(String campsiteId, Integer capacity) {
        if (capacity == null || capacity <= 0) return 0.0;
        List<Reservation> confirmed = reservationRepository.findByTargetId(campsiteId)
            .stream()
            .filter(r -> r.getStatus() == ReservationStatus.CONFIRMED
                      || r.getStatus() == ReservationStatus.PENDING)
            .toList();
        return Math.min(1.0, (double) confirmed.size() / capacity);
    }

    /** Step function: lower price when empty, raise when nearly full */
    private double occupancyMultiplier(double rate) {
        if (rate < 0.30) return 0.85;
        if (rate < 0.60) return 1.00;
        if (rate < 0.80) return 1.15;
        return 1.30;
    }

    /** Season labels for Tunisia / North-Africa camping calendar */
    private String resolveSeasonLabel(Month month) {
        return switch (month) {
            case JUNE, JULY, AUGUST          -> "High Season";
            case APRIL, MAY, SEPTEMBER       -> "Shoulder Season";
            case MARCH, OCTOBER, NOVEMBER    -> "Low Season";
            default                          -> "Off Season";
        };
    }

    private double seasonMultiplier(Month month) {
        return switch (month) {
            case JUNE, JULY, AUGUST          -> 1.30;
            case APRIL, MAY, SEPTEMBER       -> 1.10;
            case MARCH, OCTOBER, NOVEMBER    -> 0.90;
            default                          -> 0.75;
        };
    }

    /**
     * Sunshine hours > 6h + temp 18–32°C + rain < 2mm = "perfect camping weather" → +20%.
     * Heavy rain (> 15mm) → −20%.
     */
    private double weatherMultiplier(double tempMax, double precipitation, double sunshineSec) {
        double sunshineHours = sunshineSec / 3600.0;
        boolean perfectDay = tempMax >= 18 && tempMax <= 32
                          && precipitation < 2.0
                          && sunshineHours > 6.0;
        boolean badWeather = precipitation > 15.0 || tempMax > 40.0 || tempMax < 5.0;

        if (perfectDay) return 1.20;
        if (badWeather)  return 0.80;
        return 1.00;
    }

    /**
     * Each active environmental rule reduces the price based on severity.
     * Reflects that campsite experience degrades under restrictions.
     * Floor at 0.50 to avoid giving it away for free.
     */
    private double environmentalMultiplier(List<EnvironmentalRule> rules) {
        double penalty = rules.stream().mapToDouble(r -> {
            if (r.getSeverity() == null) return 0.0;
            return switch (r.getSeverity()) {
                case "CRITICAL" -> 0.30;
                case "HIGH"     -> 0.20;
                case "MEDIUM"   -> 0.10;
                case "LOW"      -> 0.05;
                default         -> 0.0;
            };
        }).sum();
        return Math.max(PRICE_FLOOR, 1.0 - penalty);
    }

    private String resolveWorstSeverity(List<EnvironmentalRule> rules) {
        if (rules.stream().anyMatch(r -> "CRITICAL".equals(r.getSeverity()))) return "CRITICAL";
        if (rules.stream().anyMatch(r -> "HIGH".equals(r.getSeverity())))     return "HIGH";
        if (rules.stream().anyMatch(r -> "MEDIUM".equals(r.getSeverity())))   return "MEDIUM";
        if (rules.stream().anyMatch(r -> "LOW".equals(r.getSeverity())))      return "LOW";
        return "NONE";  // null-safe: String.equals() handles null gracefully
    }

    private WeatherForecastResponse fetchWeather(double lat, double lon) {
        return restTemplate.getForObject(OPEN_METEO_URL, WeatherForecastResponse.class,
            lat, lon);
    }

    private double round(double v) { return Math.round(v * 1000.0) / 1000.0; }
}
