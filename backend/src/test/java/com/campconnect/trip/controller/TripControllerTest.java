package com.campconnect.trip.controller;

import com.campconnect.trip.dto.TripDTO;
import com.campconnect.trip.entity.Trip;
import com.campconnect.trip.service.ITripService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = TripController.class, excludeAutoConfiguration = {org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class})
public class TripControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ITripService tripService;

    @Autowired
    private ObjectMapper objectMapper;

    private Trip mockTrip;
    private TripDTO mockTripDto;

    @BeforeEach
    void setUp() {
        mockTrip = new Trip();
        mockTrip.setId("trip-123");
        mockTrip.setName("Test Trip");
        mockTrip.setDestination("Paris");

        mockTripDto = new TripDTO();
        mockTripDto.setName("Test Trip");
        mockTripDto.setDestination("Paris");
    }

    @Test
    void testGetAllTrips() throws Exception {
        List<Trip> trips = Arrays.asList(mockTrip);
        Mockito.when(tripService.findAll()).thenReturn(trips);

        mockMvc.perform(get("/api/trips"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("trip-123"))
                .andExpect(jsonPath("$[0].name").value("Test Trip"));
    }

    @Test
    void testGetTripById() throws Exception {
        Mockito.when(tripService.findById("trip-123")).thenReturn(mockTrip);

        mockMvc.perform(get("/api/trips/trip-123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("trip-123"))
                .andExpect(jsonPath("$.name").value("Test Trip"));
    }

    @Test
    void testCreateTrip() throws Exception {
        Mockito.when(tripService.save(any(TripDTO.class))).thenReturn(mockTrip);

        mockMvc.perform(post("/api/trips")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(mockTripDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("trip-123"));
    }

    @Test
    void testDeleteTrip() throws Exception {
        Mockito.doNothing().when(tripService).delete("trip-123");

        mockMvc.perform(delete("/api/trips/trip-123"))
                .andExpect(status().isOk());
        
        Mockito.verify(tripService, Mockito.times(1)).delete("trip-123");
    }
}
