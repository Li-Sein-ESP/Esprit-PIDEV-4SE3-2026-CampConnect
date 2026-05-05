package com.campconnect.scheduler;

import com.campconnect.service.ItineraryNotificationService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ItineraryNotificationScheduler {

    private static final Logger logger = LoggerFactory.getLogger(ItineraryNotificationScheduler.class);
    private final ItineraryNotificationService notificationService;

    /**
     * S'exécute toutes les 15 minutes pour notifier les utilisateurs
     * des événements proches (Activités, Transports).
     */
    @Scheduled(fixedRate = 900000) // 15 minutes
    public void runNotificationCycle() {
        logger.info("[SCHEDULER] Starting Intelligent Notification Cycle...");
        try {
            notificationService.generateUpcomingEventNotifications();
        } catch (Exception e) {
            logger.error("[SCHEDULER] Notification cycle failed", e);
        }
    }
}
