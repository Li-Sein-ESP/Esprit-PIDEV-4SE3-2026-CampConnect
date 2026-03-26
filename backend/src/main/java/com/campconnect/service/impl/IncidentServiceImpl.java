package com.campconnect.service.impl;

import com.campconnect.dto.IncidentDTO;
import com.campconnect.model.Incident;
import com.campconnect.model.Trip;
import com.campconnect.repository.IncidentRepository;
import com.campconnect.repository.TripRepository;
import com.campconnect.service.IncidentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IncidentServiceImpl implements IncidentService {

    private final IncidentRepository incidentRepository;
    private final TripRepository tripRepository;

    @Override
    public IncidentDTO createIncident(IncidentDTO incidentDTO) {
        Incident incident = new Incident();
        incident.setTitle(incidentDTO.getTitle());
        incident.setDescription(incidentDTO.getDescription());
        incident.setLevel(incidentDTO.getLevel());
        incident.setRegionName(incidentDTO.getRegionName());
        incident.setLatitude(incidentDTO.getLatitude());
        incident.setLongitude(incidentDTO.getLongitude());
        incident.setReporterId(incidentDTO.getReporterId());
        incident.setStatus(incidentDTO.getStatus() != null ? incidentDTO.getStatus() : "pending");

        if (incidentDTO.getTripId() != null && !incidentDTO.getTripId().isEmpty()) {
            tripRepository.findById(incidentDTO.getTripId()).ifPresent(trip -> {
                incident.setTrip(trip);
                trip.addIncident(incident);
                tripRepository.save(trip);
            });
        }

        Incident savedIncident = incidentRepository.save(incident);
        return mapToDTO(savedIncident);
    }

    @Override
    public IncidentDTO getIncidentById(String id) {
        Incident incident = incidentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Incident not found"));
        return mapToDTO(incident);
    }

    @Override
    public List<IncidentDTO> getIncidentsByTripId(String tripId) {
        return incidentRepository.findAll().stream()
            .filter(i -> i.getTrip() != null && i.getTrip().getId().equals(tripId))
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public List<IncidentDTO> getAllIncidents() {
        return incidentRepository.findAll().stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public void deleteIncident(String id) {
        System.out.println("Processing delete request for Incident ID: " + id);
        incidentRepository.deleteById(id);
        System.out.println("Delete request completed for Incident ID: " + id);
    }

    @Override
    public IncidentDTO updateIncident(String id, IncidentDTO incidentDTO) {
        System.out.println("Processing update request for Incident ID: " + id);
        Incident incident = incidentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Incident not found"));
        
        if (incidentDTO.getTitle() != null) incident.setTitle(incidentDTO.getTitle());
        if (incidentDTO.getDescription() != null) incident.setDescription(incidentDTO.getDescription());
        if (incidentDTO.getLevel() != null) incident.setLevel(incidentDTO.getLevel());
        if (incidentDTO.getRegionName() != null) incident.setRegionName(incidentDTO.getRegionName());
        
        // Coordinates and Reporter ID (Only update if not default/empty)
        if (incidentDTO.getLatitude() != 0) incident.setLatitude(incidentDTO.getLatitude());
        if (incidentDTO.getLongitude() != 0) incident.setLongitude(incidentDTO.getLongitude());
        if (incidentDTO.getReporterId() != null) incident.setReporterId(incidentDTO.getReporterId());
        
        if (incidentDTO.getStatus() != null) {
            incident.setStatus(incidentDTO.getStatus());
        }

        if (incidentDTO.getTripId() != null && !incidentDTO.getTripId().isEmpty() && !incidentDTO.getTripId().equals("default-trip")) {
            tripRepository.findById(incidentDTO.getTripId()).ifPresent(trip -> {
                incident.setTrip(trip);
            });
        }

        Incident updatedIncident = incidentRepository.save(incident);
        System.out.println("Update request completed for Incident ID: " + id);
        return mapToDTO(updatedIncident);
    }

    private IncidentDTO mapToDTO(Incident incident) {
        IncidentDTO dto = new IncidentDTO();
        dto.setId(incident.getId());
        dto.setTitle(incident.getTitle());
        dto.setDescription(incident.getDescription());
        dto.setLevel(incident.getLevel());
        dto.setRegionName(incident.getRegionName());
        dto.setLatitude(incident.getLatitude());
        dto.setLongitude(incident.getLongitude());
        dto.setReporterId(incident.getReporterId());
        dto.setReportedAt(incident.getReportedAt());
        dto.setStatus(incident.getStatus());
        if (incident.getTrip() != null) {
            dto.setTripId(incident.getTrip().getId());
        }
        return dto;
    }
}
