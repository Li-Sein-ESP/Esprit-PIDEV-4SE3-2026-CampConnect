package com.campconnect.service;

import com.campconnect.dto.IncidentDTO;
import com.campconnect.model.Incident;
import com.campconnect.model.Trip;
import com.campconnect.repository.IncidentRepository;
import com.campconnect.repository.TripRepository;
import com.campconnect.service.impl.IncidentServiceImpl;
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
public class IncidentServiceTest {

    @Mock
    private IncidentRepository incidentRepository;

    @Mock
    private TripRepository tripRepository;

    @InjectMocks
    private IncidentServiceImpl incidentService;

    private Incident incident;
    private Trip trip;
    private IncidentDTO incidentDTO;

    @BeforeEach
    void setUp() {
        trip = new Trip();
        trip.setId("trip-1");

        incident = new Incident();
        incident.setId("incident-1");
        incident.setTitle("Original Incident");
        incident.setTrip(trip);

        incidentDTO = new IncidentDTO();
        incidentDTO.setTitle("Updated Incident");
        incidentDTO.setTripId("trip-1");
        incidentDTO.setDescription("New Description");
    }

    @Test
    void testGetIncidentById() {
        when(incidentRepository.findById("incident-1")).thenReturn(Optional.of(incident));

        IncidentDTO result = incidentService.getIncidentById("incident-1");

        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("Original Incident");
        verify(incidentRepository, times(1)).findById("incident-1");
    }

    @Test
    void testCreateIncident() {
        when(tripRepository.findById("trip-1")).thenReturn(Optional.of(trip));
        when(incidentRepository.save(any(Incident.class))).thenReturn(incident);

        IncidentDTO result = incidentService.createIncident(incidentDTO);

        assertThat(result).isNotNull();
        verify(tripRepository, times(1)).findById("trip-1");
        verify(incidentRepository, times(1)).save(any(Incident.class));
    }

    @Test
    void testUpdateIncident() {
        when(incidentRepository.findById("incident-1")).thenReturn(Optional.of(incident));
        when(tripRepository.findById("trip-1")).thenReturn(Optional.of(trip));
        when(incidentRepository.save(any(Incident.class))).thenReturn(incident);

        IncidentDTO result = incidentService.updateIncident("incident-1", incidentDTO);

        assertThat(result).isNotNull();
        verify(incidentRepository, times(1)).findById("incident-1");
        verify(incidentRepository, times(1)).save(any(Incident.class));
    }

    @Test
    void testDeleteIncident() {
        doNothing().when(incidentRepository).deleteById("incident-1");

        incidentService.deleteIncident("incident-1");

        verify(incidentRepository, times(1)).deleteById("incident-1");
    }
}
