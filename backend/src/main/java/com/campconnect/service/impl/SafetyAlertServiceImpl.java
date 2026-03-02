package com.campconnect.service.impl;

import com.campconnect.dto.SafetyAlertDTO;
import com.campconnect.model.SafetyAlert;
import com.campconnect.model.Trip;
import com.campconnect.repository.SafetyAlertRepository;
import com.campconnect.repository.TripRepository;
import com.campconnect.service.SafetyAlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SafetyAlertServiceImpl implements SafetyAlertService {

    private final SafetyAlertRepository alertRepository;
    private final TripRepository tripRepository;

    @Override
    public SafetyAlertDTO createAlert(SafetyAlertDTO alertDTO) {
        SafetyAlert alert = new SafetyAlert();
        alert.setMessage(alertDTO.getMessage());
        alert.setSeverity(alertDTO.getSeverity());

        Trip trip = tripRepository.findById(alertDTO.getTripId())
            .orElseThrow(() -> new RuntimeException("Trip not found"));
        trip.addSafetyAlert(alert);
        tripRepository.save(trip);

        SafetyAlert savedAlert = alertRepository.save(alert);
        return mapToDTO(savedAlert);
    }

    @Override
    public SafetyAlertDTO getAlertById(String id) {
        SafetyAlert alert = alertRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Alert not found"));
        return mapToDTO(alert);
    }

    @Override
    public List<SafetyAlertDTO> getAlertsByTripId(String tripId) {
        return alertRepository.findAll().stream()
            .filter(a -> a.getTrip() != null && a.getTrip().getId().equals(tripId))
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public List<SafetyAlertDTO> getAllAlerts() {
        return alertRepository.findAll().stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public void deleteAlert(String id) {
        alertRepository.deleteById(id);
    }

    private SafetyAlertDTO mapToDTO(SafetyAlert alert) {
        SafetyAlertDTO dto = new SafetyAlertDTO();
        dto.setId(alert.getId());
        dto.setMessage(alert.getMessage());
        dto.setSeverity(alert.getSeverity());
        dto.setCreatedAt(alert.getCreatedAt());
        if (alert.getTrip() != null) {
            dto.setTripId(alert.getTrip().getId());
        }
        return dto;
    }
}
