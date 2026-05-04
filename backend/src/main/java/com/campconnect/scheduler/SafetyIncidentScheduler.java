package com.campconnect.scheduler;

import com.campconnect.model.Incident;
import com.campconnect.model.SafetyAlert;
import com.campconnect.repository.IncidentRepository;
import com.campconnect.repository.SafetyAlertRepository;
import com.campconnect.repository.TripRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.DirectFieldAccessor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class SafetyIncidentScheduler {

    private static final Logger log = LoggerFactory.getLogger(SafetyIncidentScheduler.class);

    private final IncidentRepository incidentRepository;
    private final SafetyAlertRepository safetyAlertRepository;
    private final TripRepository tripRepository;

    public SafetyIncidentScheduler(
            IncidentRepository incidentRepository,
            SafetyAlertRepository safetyAlertRepository,
            TripRepository tripRepository
    ) {
        this.incidentRepository = incidentRepository;
        this.safetyAlertRepository = safetyAlertRepository;
        this.tripRepository = tripRepository;
    }

    @Scheduled(cron = "${app.safety.scheduler.incidents.cron:0 */1 * * * *}")
    public void reviewStalePendingIncidents() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime cutoff = now.minusHours(24);

        List<Incident> stalePendingIncidents = incidentRepository.findByStatusAndCreatedAtBefore("pending", cutoff);
        if (stalePendingIncidents.isEmpty()) {
            log.debug("[SafetyScheduler] No stale pending incidents found");
            return;
        }

        List<SafetyAlert> alertsToCreate = new ArrayList<>();

        for (Incident incident : stalePendingIncidents) {
            DirectFieldAccessor incidentAccessor = new DirectFieldAccessor(incident);
            incidentAccessor.setPropertyValue("status", "reviewed");
            incidentAccessor.setPropertyValue("updatedAt", now);

            if (isCriticalIncident(incident)) {
                SafetyAlert alert = buildAlertFromIncident(incident);
                alertsToCreate.add(alert);
            }
        }

        incidentRepository.saveAll(stalePendingIncidents);
        if (!alertsToCreate.isEmpty()) {
            safetyAlertRepository.saveAll(alertsToCreate);
        }

        log.info("[SafetyScheduler] Reviewed {} incidents and created {} alerts",
                stalePendingIncidents.size(), alertsToCreate.size());
    }

    private boolean isCriticalIncident(Incident incident) {
        DirectFieldAccessor incidentAccessor = new DirectFieldAccessor(incident);
        Object severityValue = incidentAccessor.getPropertyValue("severity");
        Object levelValue = incidentAccessor.getPropertyValue("level");
        String severity = severityValue == null ? "" : severityValue.toString().trim().toUpperCase();
        String level = levelValue == null ? "" : levelValue.toString().trim().toUpperCase();
        return "CRITICAL".equals(severity) || "CRITICAL".equals(level);
    }

    private SafetyAlert buildAlertFromIncident(Incident incident) {
        SafetyAlert alert = new SafetyAlert();
        DirectFieldAccessor incidentAccessor = new DirectFieldAccessor(incident);
        DirectFieldAccessor alertAccessor = new DirectFieldAccessor(alert);

        Object description = incidentAccessor.getPropertyValue("description");
        Object location = incidentAccessor.getPropertyValue("location");
        Object regionName = incidentAccessor.getPropertyValue("regionName");
        Object tripId = incidentAccessor.getPropertyValue("tripId");

        alertAccessor.setPropertyValue("title", "Critical Incident Auto-Alert");
        alertAccessor.setPropertyValue("description", description == null ? "" : description.toString());
        alertAccessor.setPropertyValue("type", "ADVISORY");
        alertAccessor.setPropertyValue("severity", "CRITICAL");
        alertAccessor.setPropertyValue("status", "PENDING");
        alertAccessor.setPropertyValue("locationName", location == null ? null : location.toString());
        alertAccessor.setPropertyValue("regionName", regionName == null ? null : regionName.toString());

        if (tripId instanceof String tripIdValue && !tripIdValue.isBlank()) {
            tripRepository.findById(tripIdValue).ifPresent(trip -> alertAccessor.setPropertyValue("trip", trip));
        }

        return alert;
    }
}
