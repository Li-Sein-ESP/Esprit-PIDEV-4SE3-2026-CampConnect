package com.campconnect.scheduler;

import com.campconnect.trip.service.ISmartRescheduleService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SmartRescheduleScheduler {

    private static final Logger logger = LoggerFactory.getLogger(SmartRescheduleScheduler.class);
    private final ISmartRescheduleService rescheduleService;

    /**
     * S'exécute toutes les 30 secondes pour vérifier si des transports sont en retard
     * et ajuster les plannings en conséquence.
     */
    @Scheduled(fixedRate = 30000)
    public void checkAndRescheduleDelayedTrips() {
        logger.debug("[SCHEDULER] Checking for delayed transports to trigger Smart Reschedule...");
        try {
            rescheduleService.autoRescheduleDelayedTrips();
        } catch (Exception e) {
            logger.error("[SCHEDULER] Smart Reschedule cycle failed", e);
        }
    }
}
