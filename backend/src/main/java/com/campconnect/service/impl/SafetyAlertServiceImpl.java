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
        System.out.println("DEBUG: SIMPLE createAlert for: " + alertDTO.getTitle());
        SafetyAlert alert = new SafetyAlert();
        alert.setTitle(alertDTO.getTitle());
        alert.setDescription(alertDTO.getDescription());
        alert.setRegionName(alertDTO.getRegionName());
        alert.setLocationName(alertDTO.getLocationName());
        
        // Handle Enum mapping safely
        try {
            if (alertDTO.getType() != null) alert.setType(alertDTO.getType().toUpperCase());
            if (alertDTO.getSeverity() != null) alert.setSeverity(alertDTO.getSeverity());
        } catch (Exception e) {
            System.out.println("DEBUG: Enum mapping error: " + e.getMessage());
        }

        System.out.println("DEBUG: Saving to repository...");
        SafetyAlert savedAlert = alertRepository.save(alert);
        System.out.println("DEBUG: Success! New Alert ID: " + savedAlert.getId());
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

    @Override
    public SafetyAlertDTO updateAlert(String id, SafetyAlertDTO alertDTO) {
        SafetyAlert alert = alertRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Alert not found"));
        
        alert.setTitle(alertDTO.getTitle());
        alert.setDescription(alertDTO.getDescription());
        alert.setType(alertDTO.getType());
        alert.setSeverity(alertDTO.getSeverity());
        alert.setLocationName(alertDTO.getLocationName());
        alert.setRegionName(alertDTO.getRegionName());

        if (alertDTO.getTripId() != null) {
            Trip trip = tripRepository.findById(alertDTO.getTripId())
                .orElseThrow(() -> new RuntimeException("Trip not found"));
            alert.setTrip(trip);
        }

        SafetyAlert updatedAlert = alertRepository.save(alert);
        return mapToDTO(updatedAlert);
    }

    private SafetyAlertDTO mapToDTO(SafetyAlert alert) {
        SafetyAlertDTO dto = new SafetyAlertDTO();
        dto.setId(alert.getId());
        dto.setTitle(alert.getTitle());
        dto.setDescription(alert.getDescription());
        dto.setType(alert.getType());
        dto.setSeverity(alert.getSeverity());
        dto.setLocationName(alert.getLocationName());
        dto.setRegionName(alert.getRegionName());
        dto.setCreatedAt(alert.getCreatedAt());
        if (alert.getTrip() != null) {
            dto.setTripId(alert.getTrip().getId());
        }
        return dto;
    }
}
