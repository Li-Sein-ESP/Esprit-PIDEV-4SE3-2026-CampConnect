package com.campconnect.service;

import com.campconnect.dto.IncidentDTO;
import java.util.List;

public interface IncidentService {
    IncidentDTO createIncident(IncidentDTO incidentDTO);
    IncidentDTO getIncidentById(String id);
    List<IncidentDTO> getIncidentsByTripId(String tripId);
    List<IncidentDTO> getAllIncidents();
    IncidentDTO updateIncident(String id, IncidentDTO incidentDTO);
    void deleteIncident(String id);
}
