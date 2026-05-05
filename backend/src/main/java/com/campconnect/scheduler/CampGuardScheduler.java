package com.campconnect.scheduler;

import com.campconnect.dto.TriggerActionsResponseDto;
import com.campconnect.service.CampGuardService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class CampGuardScheduler {

    private static final Logger log = LoggerFactory.getLogger(CampGuardScheduler.class);

    private final CampGuardService campGuardService;

    @Value("${campguard.scheduler.enabled:false}")
    private boolean schedulerEnabled;

    public CampGuardScheduler(CampGuardService campGuardService) {
        this.campGuardService = campGuardService;
    }

    @Scheduled(cron = "${campguard.scheduler.cron:0 0 2 * * ?}")
    public void runDailyTrigger() {
        if (!schedulerEnabled) {
            log.debug("[CampGuardScheduler] Scheduler disabled. Skipping run.");
            return;
        }

        TriggerActionsResponseDto result = campGuardService.triggerActions();
        log.info("[CampGuardScheduler] Triggered actions. queued={}, skippedAntiSpam={}, runDate={}",
                result.getQueued(), result.getSkippedAntiSpam(), result.getRunDate());
    }
}
