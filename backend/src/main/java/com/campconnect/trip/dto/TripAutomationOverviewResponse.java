package com.campconnect.trip.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

/**
 * Réponse JSON pour exposer côté API / Swagger ce que les schedulers backend traitent.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TripAutomationOverviewResponse {

    private Instant generatedAt;
    private boolean adminScope;
    private SchedulerCadenceDto schedulers;
    private List<DelayedTransportSnapshotDto> delayedTransports;
    private UpcomingRemindersDto upcomingReminders;
    private TripStatusEngineDto tripStatusEngine;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SchedulerCadenceDto {
        private String smartReschedule;
        private String itineraryNotifications;
        private String tripStatusUpdates;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DelayedTransportSnapshotDto {
        private String transportId;
        private String tripId;
        private String tripTitle;
        private int delayMinutes;
        private String provider;
        private String mode;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpcomingRemindersDto {
        private Instant windowStart;
        private Instant windowEnd;
        private int activityCount;
        private int transportCount;
        private List<String> activitySummaries;
        private List<String> transportSummaries;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TripStatusEngineDto {
        private long tripsEligiblePlannedToOngoing;
        private long tripsEligibleToCompleted;
    }
}
