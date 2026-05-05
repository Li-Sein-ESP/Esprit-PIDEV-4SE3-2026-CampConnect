package com.campconnect.pricing;

import com.campconnect.analytics.CampsiteAudit;
import com.campconnect.analytics.PricingTrend;
import com.campconnect.analytics.AnalyticsRepository;
import com.campconnect.model.Campsite;
import com.campconnect.repository.CampsiteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Requirement: Implement a scheduler function within their module.
 * This function applies pricing logic and updates the JPA/Audit database.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DynamicPricingScheduler {

    private final DynamicPricingService pricingService;
    private final CampsiteRepository campsiteRepository;
    private final AnalyticsRepository analyticsRepository;

    /**
     * Runs every 10 minutes (600,000 ms).
     * Calculates the dynamic price for all campsites and persists an audit snapshot.
     */
    @Scheduled(fixedRate = 600000)
    public void performPricingAudit() {
        log.info("[Scheduler] Starting periodic pricing optimization scan...");
        
        List<Campsite> campsites = campsiteRepository.findAll();
        
        for (Campsite campsite : campsites) {
            try {
                PricingFactors factors = pricingService.computePrice(campsite.getId());
                
                // Create Audit record for JPA (Requirement: Database Update via Scheduler)
                CampsiteAudit audit = CampsiteAudit.builder()
                        .campsiteId(campsite.getId())
                        .campsiteName(campsite.getName())
                        .region(campsite.getLocation() != null ? campsite.getLocation() : "Unknown")
                        .auditDate(LocalDateTime.now())
                        .build();
                
                // Add individual trends (Satisfies Join Requirement later)
                audit.addTrend(PricingTrend.builder()
                        .factorName("Global Dynamic Price")
                        .multiplier(factors.getDynamicPrice() / (factors.getBasePrice() > 0 ? factors.getBasePrice() : 1.0))
                        .impactAmount(factors.getSavingsOrSurcharge())
                        .build());

                audit.addTrend(PricingTrend.builder()
                        .factorName("Occupancy")
                        .multiplier(factors.getOccupancyMultiplier())
                        .impactAmount(0.0)
                        .build());

                analyticsRepository.save(audit);
                log.debug("[Scheduler] Audit saved for campsite: {}", campsite.getName());
                
            } catch (Exception e) {
                log.error("[Scheduler] Failed to audit campsite {}: {}", campsite.getId(), e.getMessage());
            }
        }
        
        log.info("[Scheduler] Pricing optimization scan completed for {} campsites.", campsites.size());
    }
}
