package com.campconnect.service;

import com.campconnect.dto.OpenIncidentSummaryDTO;
import com.campconnect.dto.SchedulerImpactDTO;
import com.campconnect.model.Incident;

import java.util.List;

public interface SafetyAnalyticsService {
    List<OpenIncidentSummaryDTO> getOpenIncidentSummary();

    SchedulerImpactDTO getSchedulerImpact();

    List<Incident> getIncidentsByTripCreatorStatusAndSeverity(String creatorId, String status, List<String> severities);
}
