package com.campconnect.service;

import com.campconnect.dto.TripDTO;
import com.campconnect.model.Trip;
import com.campconnect.model.Group;
import com.campconnect.repository.TripRepository;
import com.campconnect.repository.GroupRepository;
import com.campconnect.service.impl.TripServiceImpl;
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
public class TripServiceTest {

    @Mock
    private TripRepository tripRepository;

    @Mock
    private GroupRepository groupRepository;

    @InjectMocks
    private TripServiceImpl tripService;

    private Trip trip;
    private Group group;
    private TripDTO tripDTO;

    @BeforeEach
    void setUp() {
        group = new Group();
        group.setId("group-1");

        trip = new Trip();
        trip.setId("trip-1");
        trip.setName("Original Trip");
        trip.setGroup(group);

        tripDTO = new TripDTO();
        tripDTO.setName("Updated Trip");
        tripDTO.setGroupId("group-1");
        tripDTO.setDestination("New Destination");
    }

    @Test
    void testGetAllTrips() {
        when(tripRepository.findAll()).thenReturn(Arrays.asList(trip));

        List<TripDTO> result = tripService.getAllTrips();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Original Trip");
        verify(tripRepository, times(1)).findAll();
    }

    @Test
    void testGetTripById() {
        when(tripRepository.findById("trip-1")).thenReturn(Optional.of(trip));

        TripDTO result = tripService.getTripById("trip-1");

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Original Trip");
        verify(tripRepository, times(1)).findById("trip-1");
    }

    @Test
    void testCreateTrip() {
        when(groupRepository.findById("group-1")).thenReturn(Optional.of(group));
        when(tripRepository.save(any(Trip.class))).thenReturn(trip);

        TripDTO result = tripService.createTrip(tripDTO);

        assertThat(result).isNotNull();
        verify(groupRepository, times(1)).findById("group-1");
        verify(tripRepository, times(1)).save(any(Trip.class));
    }

    @Test
    void testUpdateTrip() {
        when(tripRepository.findById("trip-1")).thenReturn(Optional.of(trip));
        when(groupRepository.findById("group-1")).thenReturn(Optional.of(group));
        when(tripRepository.save(any(Trip.class))).thenReturn(trip);

        TripDTO result = tripService.updateTrip("trip-1", tripDTO);

        assertThat(result).isNotNull();
        verify(tripRepository, times(1)).findById("trip-1");
        verify(tripRepository, times(1)).save(any(Trip.class));
    }

    @Test
    void testDeleteTrip() {
        doNothing().when(tripRepository).deleteById("trip-1");

        tripService.deleteTrip("trip-1");

        verify(tripRepository, times(1)).deleteById("trip-1");
    }
}
