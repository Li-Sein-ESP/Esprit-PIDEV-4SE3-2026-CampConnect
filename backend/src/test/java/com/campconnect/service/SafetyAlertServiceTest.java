package com.campconnect.service;

import com.campconnect.dto.SafetyAlertDTO;
import com.campconnect.model.AlertSeverity;
import com.campconnect.model.SafetyAlert;
import com.campconnect.model.Trip;
import com.campconnect.repository.SafetyAlertRepository;
import com.campconnect.repository.TripRepository;
import com.campconnect.service.impl.SafetyAlertServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SafetyAlertServiceTest {

    @Mock
    private SafetyAlertRepository alertRepository;

    @Mock
    private TripRepository tripRepository;

    @InjectMocks
    private SafetyAlertServiceImpl alertService;

    private SafetyAlert alert;
    private Trip trip;
    private SafetyAlertDTO alertDTO;

    @BeforeEach
    void setUp() {
        trip = new Trip();
        trip.setId("trip-1");

        alert = new SafetyAlert();
        alert.setId("alert-1");
        alert.setTitle("Initial Alert");
        alert.setDescription("Initial Description");
        alert.setTrip(trip);
        alert.setSeverity(AlertSeverity.ADVISORY);

        alertDTO = new SafetyAlertDTO();
        alertDTO.setTitle("Updated Alert");
        alertDTO.setDescription("Updated Description");
        alertDTO.setTripId("trip-1");
        alertDTO.setSeverity(AlertSeverity.CRITICAL);
    }

    @Test
    void testGetAllAlerts() {
        when(alertRepository.findAll()).thenReturn(Arrays.asList(alert));

        List<SafetyAlertDTO> result = alertService.getAllAlerts();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("Initial Alert");
        verify(alertRepository, times(1)).findAll();
    }

    @Test
    void testGetAlertById() {
        when(alertRepository.findById("alert-1")).thenReturn(Optional.of(alert));

        SafetyAlertDTO result = alertService.getAlertById("alert-1");

        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("Initial Alert");
        verify(alertRepository, times(1)).findById("alert-1");
    }

    @Test
    void testCreateAlert() {
        when(tripRepository.findById("trip-1")).thenReturn(Optional.of(trip));
        when(alertRepository.save(any(SafetyAlert.class))).thenReturn(alert);

        SafetyAlertDTO result = alertService.createAlert(alertDTO);

        assertThat(result).isNotNull();
        verify(tripRepository, times(1)).findById("trip-1");
        verify(alertRepository, times(1)).save(any(SafetyAlert.class));
    }

    @Test
    void testUpdateAlert() {
        when(alertRepository.findById("alert-1")).thenReturn(Optional.of(alert));
        when(tripRepository.findById("trip-1")).thenReturn(Optional.of(trip));
        when(alertRepository.save(any(SafetyAlert.class))).thenReturn(alert);

        SafetyAlertDTO result = alertService.updateAlert("alert-1", alertDTO);

        assertThat(result).isNotNull();
        verify(alertRepository, times(1)).findById("alert-1");
        verify(alertRepository, times(1)).save(any(SafetyAlert.class));
    }

    @Test
    void testDeleteAlert() {
        doNothing().when(alertRepository).deleteById("alert-1");

        alertService.deleteAlert("alert-1");

        verify(alertRepository, times(1)).deleteById("alert-1");
    }
}
