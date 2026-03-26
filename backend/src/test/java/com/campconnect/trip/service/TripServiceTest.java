package com.campconnect.trip.service;

import com.campconnect.trip.dto.TripDTO;
import com.campconnect.trip.entity.Trip;
import com.campconnect.trip.repository.TripRepository;
import com.campconnect.trip.service.impl.TripServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;

@ExtendWith(MockitoExtension.class)
public class TripServiceTest {

    @Mock
    private TripRepository tripRepository;

    @InjectMocks
    private TripServiceImpl tripService;

    private Trip mockTrip;

    @BeforeEach
    void setUp() {
        mockTrip = new Trip();
        mockTrip.setId("trip-123");
        mockTrip.setName("Summer Camp");
        mockTrip.setDestination("Alps");
    }

    @Test
    void testFindAll() {
        Mockito.when(tripRepository.findAll()).thenReturn(Arrays.asList(mockTrip));

        List<Trip> result = tripService.findAll();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Summer Camp", result.get(0).getName());
    }

    @Test
    void testFindById() {
        Mockito.when(tripRepository.findById("trip-123")).thenReturn(Optional.of(mockTrip));

        Trip result = tripService.findById("trip-123");

        assertNotNull(result);
        assertEquals("trip-123", result.getId());
        assertEquals("Summer Camp", result.getName());
    }

    @Test
    void testDelete() {
        Mockito.when(tripRepository.existsById("trip-123")).thenReturn(true);
        Mockito.doNothing().when(tripRepository).deleteById("trip-123");

        assertDoesNotThrow(() -> tripService.delete("trip-123"));
        Mockito.verify(tripRepository, Mockito.times(1)).deleteById("trip-123");
    }
}
