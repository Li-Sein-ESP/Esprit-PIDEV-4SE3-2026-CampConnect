package com.campconnect.dto;

public class SchedulerImpactDTO {
    private long reviewedIncidentsLast24h;
    private long autoAlertsCreatedLast24h;
    private long stalePendingIncidents;

    public SchedulerImpactDTO() {
    }

    public SchedulerImpactDTO(long reviewedIncidentsLast24h, long autoAlertsCreatedLast24h, long stalePendingIncidents) {
        this.reviewedIncidentsLast24h = reviewedIncidentsLast24h;
        this.autoAlertsCreatedLast24h = autoAlertsCreatedLast24h;
        this.stalePendingIncidents = stalePendingIncidents;
    }

    public long getReviewedIncidentsLast24h() {
        return reviewedIncidentsLast24h;
    }

    public void setReviewedIncidentsLast24h(long reviewedIncidentsLast24h) {
        this.reviewedIncidentsLast24h = reviewedIncidentsLast24h;
    }

    public long getAutoAlertsCreatedLast24h() {
        return autoAlertsCreatedLast24h;
    }

    public void setAutoAlertsCreatedLast24h(long autoAlertsCreatedLast24h) {
        this.autoAlertsCreatedLast24h = autoAlertsCreatedLast24h;
    }

    public long getStalePendingIncidents() {
        return stalePendingIncidents;
    }

    public void setStalePendingIncidents(long stalePendingIncidents) {
        this.stalePendingIncidents = stalePendingIncidents;
    }
}
