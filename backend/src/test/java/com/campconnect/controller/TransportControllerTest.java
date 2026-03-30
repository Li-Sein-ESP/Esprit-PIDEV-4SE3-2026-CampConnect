package com.campconnect.controller;

import com.campconnect.transport.controller.TransportController;
import com.campconnect.transport.dto.TransportDTO;
import com.campconnect.transport.entity.Transport;
import com.campconnect.transport.enums.TransportMode;
import com.campconnect.transport.service.ITransportService;
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
import java.util.Arrays;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TransportController.class)
@AutoConfigureMockMvc(addFilters = false)
class TransportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ITransportService transportService;

    @Autowired
    private ObjectMapper objectMapper;

    private Transport sampleTransport;
    private TransportDTO sampleTransportDTO;

    @BeforeEach
    void setUp() {
        sampleTransport = new Transport();
        sampleTransport.setId("transport-001");
        sampleTransport.setMode(TransportMode.BUS);
        sampleTransport.setCost(BigDecimal.valueOf(150));
        sampleTransport.setDuration(120);
        sampleTransport.setProvider("TunisiaBus");

        sampleTransportDTO = new TransportDTO();
        sampleTransportDTO.setMode(TransportMode.BUS);
        sampleTransportDTO.setCost(BigDecimal.valueOf(150));
        sampleTransportDTO.setDuration(120);
        sampleTransportDTO.setProvider("TunisiaBus");
    }

    // ─── READ ───────────────────────────────────────────────────────────────

    @Test
    void getAll_ShouldReturn200WithListOfTransports() throws Exception {
        when(transportService.findAll()).thenReturn(Arrays.asList(sampleTransport));

        mockMvc.perform(get("/api/transports"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value("transport-001"))
                .andExpect(jsonPath("$[0].provider").value("TunisiaBus"));
    }

    @Test
    void getAll_ShouldReturnEmptyList_WhenNoTransports() throws Exception {
        when(transportService.findAll()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/transports"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void getById_ShouldReturn200WithTransport() throws Exception {
        when(transportService.findById("transport-001")).thenReturn(sampleTransport);

        mockMvc.perform(get("/api/transports/transport-001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("transport-001"))
                .andExpect(jsonPath("$.provider").value("TunisiaBus"))
                .andExpect(jsonPath("$.duration").value(120));
    }

    @Test
    void getByTripId_ShouldReturn200WithTripTransports() throws Exception {
        sampleTransport.setTripId("trip-123");
        when(transportService.findByTripId("trip-123")).thenReturn(Arrays.asList(sampleTransport));

        mockMvc.perform(get("/api/transports/trip/trip-123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].tripId").value("trip-123"));
    }

    // ─── CREATE ─────────────────────────────────────────────────────────────

    @Test
    void create_ShouldReturn200WithCreatedTransport() throws Exception {
        when(transportService.save(any(TransportDTO.class))).thenReturn(sampleTransport);

        mockMvc.perform(post("/api/transports")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(sampleTransportDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("transport-001"))
                .andExpect(jsonPath("$.provider").value("TunisiaBus"));
    }

    // ─── UPDATE ─────────────────────────────────────────────────────────────

    @Test
    void update_ShouldReturn200WithUpdatedTransport() throws Exception {
        sampleTransportDTO.setProvider("UpdatedBus");
        sampleTransport.setProvider("UpdatedBus");

        when(transportService.update(eq("transport-001"), any(TransportDTO.class))).thenReturn(sampleTransport);

        mockMvc.perform(put("/api/transports/transport-001")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(sampleTransportDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.provider").value("UpdatedBus"));
    }

    // ─── DELETE ─────────────────────────────────────────────────────────────

    @Test
    void delete_ShouldReturn200AndCallService() throws Exception {
        doNothing().when(transportService).delete("transport-001");

        mockMvc.perform(delete("/api/transports/transport-001"))
                .andExpect(status().isOk());

        verify(transportService, times(1)).delete("transport-001");
    }

    // ─── ASSIGN ─────────────────────────────────────────────────────────────

    @Test
    void assignTrip_ShouldReturn200AndLinkTransportToTrip() throws Exception {
        doNothing().when(transportService).assignToTrip("transport-001", "trip-123");

        mockMvc.perform(post("/api/transports/transport-001/assign-trip/trip-123"))
                .andExpect(status().isOk());

        verify(transportService, times(1)).assignToTrip("transport-001", "trip-123");
    }
}
