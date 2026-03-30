package com.campconnect.controller;

import com.campconnect.dto.TripIntentDto;
import com.campconnect.model.TripIntent;
import com.campconnect.model.TripIntentStatus;
import com.campconnect.service.ITripIntentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TripIntentController.class)
@AutoConfigureMockMvc(addFilters = false)
class TripIntentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ITripIntentService tripIntentService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void createTripIntent_ShouldReturnCreated() throws Exception {
        // Arrange
        TripIntentDto dto = new TripIntentDto();
        dto.setTitle("Camping Trip");
        dto.setCreatorUserId("user-1");

        TripIntent created = TripIntent.builder().id("trip-1").title("Camping Trip").build();
        when(tripIntentService.createTripIntent(any(TripIntent.class))).thenReturn(created);

        // Act & Assert
        mockMvc.perform(post("/api/trip-intents")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("trip-1"));
    }

    @Test
    void getTripIntentById_ShouldReturnIntent() throws Exception {
        // Arrange
        TripIntent trip = TripIntent.builder().id("trip-1").title("Test Trip").build();
        when(tripIntentService.getTripIntentById("trip-1")).thenReturn(trip);

        // Act & Assert
        mockMvc.perform(get("/api/trip-intents/trip-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("trip-1"));
    }

    @Test
    void getAllOpenTripIntents_ShouldReturnList() throws Exception {
        // Arrange
        TripIntent trip = TripIntent.builder().id("trip-1").status(TripIntentStatus.OPEN).build();
        when(tripIntentService.getAllOpenTripIntents()).thenReturn(Collections.singletonList(trip));

        // Act & Assert
        mockMvc.perform(get("/api/trip-intents/open"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("trip-1"));
    }
}
