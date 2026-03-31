package com.campconnect.controller;

import com.campconnect.dto.EventDTO;
import com.campconnect.service.IEventServices;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class EventsControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @Mock
    private IEventServices eventService;

    @InjectMocks
    private EventsController eventsController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(eventsController)
                .setControllerAdvice(new com.campconnect.exception.GlobalExceptionHandler())
                .build();
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
    }

    // ─── GET ALL ───────────────────────────────────────────────
    @Test
    void getAllEvents_ShouldReturn200AndListOfEvents() throws Exception {
        EventDTO event1 = new EventDTO();
        event1.setId("1"); event1.setTitle("Desert Hike");

        EventDTO event2 = new EventDTO();
        event2.setId("2"); event2.setTitle("Forest Camping");

        when(eventService.getAllEvents()).thenReturn(Arrays.asList(event1, event2));

        mockMvc.perform(get("/api/events").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(2))
                .andExpect(jsonPath("$[0].title").value("Desert Hike"))
                .andExpect(jsonPath("$[1].title").value("Forest Camping"));

        verify(eventService, times(1)).getAllEvents();
    }

    @Test
    void getAllEvents_WhenEmpty_ShouldReturn200EmptyList() throws Exception {
        when(eventService.getAllEvents()).thenReturn(List.of());

        mockMvc.perform(get("/api/events"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(0));
    }

    // ─── GET BY ID ─────────────────────────────────────────────
    @Test
    void getEventById_WhenExists_ShouldReturn200() throws Exception {
        EventDTO event = new EventDTO();
        event.setId("1"); event.setTitle("Yoga Retreat");

        when(eventService.getEventById("1")).thenReturn(event);

        mockMvc.perform(get("/api/events/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Yoga Retreat"));
    }

    @Test
    void getEventById_WhenNotFound_ShouldReturn404() throws Exception {
        when(eventService.getEventById("999")).thenReturn(null);

        mockMvc.perform(get("/api/events/999"))
                .andExpect(status().isNotFound());
    }

    // ─── UPDATE ────────────────────────────────────────────────
    @Test
    void updateEvent_WhenExists_ShouldReturn200() throws Exception {
        EventDTO updated = new EventDTO();
        updated.setId("1"); updated.setTitle("Updated Hike");
        updated.setCategoryName("Adventure");
        updated.setType(com.campconnect.enums.EventType.HIKE);
        updated.setCapacity(10);

        when(eventService.updateEvent(eq("1"), any(EventDTO.class))).thenReturn(updated);

        mockMvc.perform(put("/api/events/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updated)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Hike"));
    }

    @Test
    void updateEvent_WhenNotFound_ShouldReturn404() throws Exception {
        EventDTO dto = new EventDTO();
        dto.setTitle("Title");
        dto.setCategoryName("Adventure");
        dto.setType(com.campconnect.enums.EventType.HIKE);
        dto.setCapacity(10);

        when(eventService.updateEvent(eq("999"), any(EventDTO.class))).thenReturn(null);

        mockMvc.perform(put("/api/events/999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isNotFound());
    }

    // ─── POST ──────────────────────────────────────────────────
    @Test
    void createEvent_WhenValid_ShouldReturn200() throws Exception {
        EventDTO newEvent = new EventDTO();
        newEvent.setTitle("Desert Survival");
        newEvent.setCategoryName("Survival");
        newEvent.setType(com.campconnect.enums.EventType.CAMP);
        newEvent.setCapacity(20);

        when(eventService.createEvent(any(EventDTO.class))).thenReturn(newEvent);

        mockMvc.perform(post("/api/events")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newEvent)))
                .andExpect(status().isOk());
    }

    @Test
    void createEvent_WhenInvalid_ShouldReturn400() throws Exception {
        EventDTO invalidEvent = new EventDTO(); // Missing fields triggers @Valid

        mockMvc.perform(post("/api/events")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidEvent)))
                .andExpect(status().isBadRequest());
    }

    // ─── DELETE ────────────────────────────────────────────────
    @Test
    void deleteEvent_ShouldReturn204NoContent() throws Exception {
        doNothing().when(eventService).deleteEvent("1");

        mockMvc.perform(delete("/api/events/1"))
                .andExpect(status().isNoContent());

        verify(eventService, times(1)).deleteEvent("1");
    }
}
