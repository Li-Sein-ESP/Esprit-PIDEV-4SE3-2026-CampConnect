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

        Trip trip = tripRepository.findById(incidentDTO.getTripId())
            .orElseThrow(() -> new RuntimeException("Trip not found"));
        trip.addIncident(incident);
        tripRepository.save(trip);

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
    public void deleteIncident(String id) {
        incidentRepository.deleteById(id);
    }

    private IncidentDTO mapToDTO(Incident incident) {
        IncidentDTO dto = new IncidentDTO();
        dto.setId(incident.getId());
        dto.setTitle(incident.getTitle());
        dto.setDescription(incident.getDescription());
        dto.setReportedAt(incident.getReportedAt());
        if (incident.getTrip() != null) {
            dto.setTripId(incident.getTrip().getId());
        }
        return dto;
    }
}
