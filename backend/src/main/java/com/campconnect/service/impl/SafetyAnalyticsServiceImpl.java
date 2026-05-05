package com.campconnect.service.impl;

import com.campconnect.dto.OpenIncidentSummaryDTO;
import com.campconnect.dto.SchedulerImpactDTO;
import com.campconnect.model.Incident;
import com.campconnect.model.Trip;
import com.campconnect.model.SafetyAlert;
import com.campconnect.repository.IncidentRepository;
import com.campconnect.repository.SafetyAlertRepository;
import com.campconnect.repository.TripRepository;
import com.campconnect.service.SafetyAnalyticsService;
import org.springframework.beans.DirectFieldAccessor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class SafetyAnalyticsServiceImpl implements SafetyAnalyticsService {

    private final IncidentRepository incidentRepository;
    private final TripRepository tripRepository;
    private final SafetyAlertRepository safetyAlertRepository;

    public SafetyAnalyticsServiceImpl(
            IncidentRepository incidentRepository,
            TripRepository tripRepository,
            SafetyAlertRepository safetyAlertRepository
    ) {
        this.incidentRepository = incidentRepository;
        this.tripRepository = tripRepository;
        this.safetyAlertRepository = safetyAlertRepository;
    }

    @Override
    public List<OpenIncidentSummaryDTO> getOpenIncidentSummary() {
        return incidentRepository.findOpenIncidentSummary();
    }

    @Override
    public SchedulerImpactDTO getSchedulerImpact() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime last24h = now.minusHours(24);

        long reviewedIncidentsLast24h = incidentRepository.findByStatus("reviewed").stream()
                .filter(incident -> {
                    DirectFieldAccessor accessor = new DirectFieldAccessor(incident);
                    Object updatedAtValue = accessor.getPropertyValue("updatedAt");
                    LocalDateTime updatedAt = updatedAtValue instanceof LocalDateTime
                            ? (LocalDateTime) updatedAtValue
                            : null;
                    return updatedAt != null && updatedAt.isAfter(last24h);
                })
                .count();

        long autoAlertsCreatedLast24h = safetyAlertRepository.findByStatus("PENDING").stream()
                .filter(alert -> isAutoAlertCreatedAfter(alert, last24h))
                .count();

        long stalePendingIncidents = incidentRepository.findByStatus("pending").stream()
                .filter(incident -> {
                    DirectFieldAccessor accessor = new DirectFieldAccessor(incident);
                    Object createdAtValue = accessor.getPropertyValue("createdAt");
                    LocalDateTime createdAt = createdAtValue instanceof LocalDateTime
                            ? (LocalDateTime) createdAtValue
                            : null;
                    return createdAt != null && createdAt.isBefore(last24h);
                })
                .count();

        return new SchedulerImpactDTO(
                reviewedIncidentsLast24h,
                autoAlertsCreatedLast24h,
                stalePendingIncidents
        );
    }

    @Override
    public List<Incident> getIncidentsByTripCreatorStatusAndSeverity(String creatorId, String status, List<String> severities) {
        List<Trip> trips = tripRepository.findByCreatorId(creatorId);
        List<String> tripIds = new ArrayList<>();
        for (Trip trip : trips) {
            DirectFieldAccessor accessor = new DirectFieldAccessor(trip);
            Object idValue = accessor.getPropertyValue("id");
            if (idValue instanceof String id && !id.isBlank()) {
                tripIds.add(id);
            }
        }

        if (tripIds.isEmpty()) {
            return Collections.emptyList();
        }

        return incidentRepository.findByTripIdInAndStatusAndSeverityIn(tripIds, status, severities);
    }

    private boolean isAutoAlertCreatedAfter(SafetyAlert alert, LocalDateTime threshold) {
        DirectFieldAccessor accessor = new DirectFieldAccessor(alert);
        Object createdAtValue = accessor.getPropertyValue("createdAt");
        LocalDateTime createdAt = createdAtValue instanceof LocalDateTime
                ? (LocalDateTime) createdAtValue
                : null;
        if (createdAt == null || createdAt.isBefore(threshold)) {
            return false;
        }

        Object titleValue = accessor.getPropertyValue("title");
        String title = titleValue == null ? null : titleValue.toString();
        return title != null && title.equals("Critical Incident Auto-Alert");
    }
}
