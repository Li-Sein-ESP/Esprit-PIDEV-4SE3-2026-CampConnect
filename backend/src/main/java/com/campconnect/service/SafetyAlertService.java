package com.campconnect.service;

import com.campconnect.dto.SafetyAlertDTO;
import java.util.List;

public interface SafetyAlertService {
    SafetyAlertDTO createAlert(SafetyAlertDTO alertDTO);
    SafetyAlertDTO getAlertById(String id);
    List<SafetyAlertDTO> getAlertsByTripId(String tripId);
    List<SafetyAlertDTO> getAllAlerts();
    SafetyAlertDTO updateAlert(String id, SafetyAlertDTO alertDTO);
    void deleteAlert(String id);
}
