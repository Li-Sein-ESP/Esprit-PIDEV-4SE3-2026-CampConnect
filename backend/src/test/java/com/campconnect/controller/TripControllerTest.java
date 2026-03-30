package com.campconnect.controller;

import com.campconnect.trip.controller.TripController;
import com.campconnect.trip.dto.TripDTO;
import com.campconnect.trip.entity.Trip;
import com.campconnect.trip.enums.DifficultyLevel;
import com.campconnect.trip.enums.TripStatus;
import com.campconnect.trip.service.ITripService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TripController.class)
@AutoConfigureMockMvc(addFilters = false)
class TripControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean(name = "itineraryTripService")
    private ITripService tripService;

    @Autowired
    private ObjectMapper objectMapper;

    private Trip sampleTrip;
    private TripDTO sampleTripDTO;

    @BeforeEach
    void setUp() {
        // Build a sample Trip entity
        sampleTrip = new Trip();
        sampleTrip.setId("trip-123");
        sampleTrip.setTitle("Yosemite Adventure");
        sampleTrip.setDifficulty(DifficultyLevel.MODERATE);
        sampleTrip.setTotalBudget(BigDecimal.valueOf(500));
        sampleTrip.setStatus(TripStatus.PLANNED);
        sampleTrip.setParticipants(4);
        sampleTrip.setUserId("user-001");
        sampleTrip.setStartDate(Instant.parse("2026-06-01T00:00:00Z"));
        sampleTrip.setEndDate(Instant.parse("2026-06-07T00:00:00Z"));

        // Build a sample TripDTO for create/update
        sampleTripDTO = new TripDTO();
        sampleTripDTO.setTitle("Yosemite Adventure");
        sampleTripDTO.setDifficulty(DifficultyLevel.MODERATE);
        sampleTripDTO.setTotalBudget(BigDecimal.valueOf(500));
        sampleTripDTO.setStatus(TripStatus.PLANNED);
        sampleTripDTO.setParticipants(4);
        sampleTripDTO.setUserId("user-001");
        sampleTripDTO.setStartDate(Instant.parse("2026-06-01T00:00:00Z"));
        sampleTripDTO.setEndDate(Instant.parse("2026-06-07T00:00:00Z"));
    }

    // ─── READ ───────────────────────────────────────────────────────────────

    @Test
    void getAll_ShouldReturn200WithListOfTrips() throws Exception {
        List<Trip> trips = Arrays.asList(sampleTrip);
        when(tripService.findAll()).thenReturn(trips);

        mockMvc.perform(get("/api/trips")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value("trip-123"))
                .andExpect(jsonPath("$[0].title").value("Yosemite Adventure"));
    }

    @Test
    void getAll_ShouldReturnEmptyList_WhenNoTrips() throws Exception {
        when(tripService.findAll()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/trips"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void getById_ShouldReturn200WithTrip() throws Exception {
        when(tripService.findById("trip-123")).thenReturn(sampleTrip);

        mockMvc.perform(get("/api/trips/trip-123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("trip-123"))
                .andExpect(jsonPath("$.title").value("Yosemite Adventure"))
                .andExpect(jsonPath("$.participants").value(4));
    }

    @Test
    void getByUserId_ShouldReturn200WithUserTrips() throws Exception {
        when(tripService.findByUserId("user-001")).thenReturn(Arrays.asList(sampleTrip));

        mockMvc.perform(get("/api/trips/user/user-001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].userId").value("user-001"));
    }

    @Test
    void getTemplates_ShouldReturn200WithTemplateTrips() throws Exception {
        sampleTrip.setTemplate(true);
        when(tripService.findTemplateTrips()).thenReturn(Arrays.asList(sampleTrip));

        mockMvc.perform(get("/api/trips/templates"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].template").value(true));
    }

    // ─── CREATE ─────────────────────────────────────────────────────────────

    @Test
    void create_ShouldReturn200WithCreatedTrip() throws Exception {
        when(tripService.save(any(TripDTO.class))).thenReturn(sampleTrip);

        mockMvc.perform(post("/api/trips")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(sampleTripDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("trip-123"))
                .andExpect(jsonPath("$.title").value("Yosemite Adventure"));
    }

    // ─── UPDATE ─────────────────────────────────────────────────────────────

    @Test
    void update_ShouldReturn200WithUpdatedTrip() throws Exception {
        sampleTripDTO.setTitle("Yosemite Adventure - Updated");
        sampleTrip.setTitle("Yosemite Adventure - Updated");

        when(tripService.update(eq("trip-123"), any(TripDTO.class))).thenReturn(sampleTrip);

        mockMvc.perform(put("/api/trips/trip-123")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(sampleTripDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Yosemite Adventure - Updated"));
    }

    // ─── DELETE ─────────────────────────────────────────────────────────────

    @Test
    void delete_ShouldReturn200() throws Exception {
        doNothing().when(tripService).delete("trip-123");

        mockMvc.perform(delete("/api/trips/trip-123"))
                .andExpect(status().isOk());

        verify(tripService, times(1)).delete("trip-123");
    }

    // ─── ASSIGN ─────────────────────────────────────────────────────────────

    @Test
    void assignTransport_ShouldReturn200() throws Exception {
        doNothing().when(tripService).addTransportToTrip("trip-123", "transport-456");

        mockMvc.perform(post("/api/trips/trip-123/assign-transport/transport-456"))
                .andExpect(status().isOk());

        verify(tripService, times(1)).addTransportToTrip("trip-123", "transport-456");
    }

    @Test
    void assignItinerary_ShouldReturn200() throws Exception {
        doNothing().when(tripService).addItineraryToTrip("trip-123", "itinerary-789");

        mockMvc.perform(post("/api/trips/trip-123/assign-itinerary/itinerary-789"))
                .andExpect(status().isOk());

        verify(tripService, times(1)).addItineraryToTrip("trip-123", "itinerary-789");
    }
}
