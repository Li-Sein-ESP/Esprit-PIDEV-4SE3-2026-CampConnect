package com.campconnect.controller;

import com.campconnect.model.Reservation;
import com.campconnect.service.ReservationServiceImpl;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ReservationController.class)
@AutoConfigureMockMvc(addFilters = false) // Désactive la sécurité pour simplifier le test d'API
class ReservationControllerTest {

    @Autowired
    private MockMvc mockMvc; // Permet de simuler des appels HTTP

    @MockBean
    private ReservationServiceImpl reservationService; // Mock du service

    @Test
    void getUserReservations_ShouldReturnList() throws Exception {
        // Arrange
        Reservation r1 = new Reservation();
        r1.setId("1");
        r1.setTargetId("Site A");
        
        when(reservationService.getUserReservations("user-1")).thenReturn(Arrays.asList(r1));

        // Act & Assert
        mockMvc.perform(get("/api/reservations/user/user-1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk()) // On attend un code 200
                .andExpect(jsonPath("$[0].id").value("1")) // On vérifie le contenu JSON
                .andExpect(jsonPath("$[0].targetId").value("Site A"));
    }

    @Test
    void getReservationById_ShouldReturnReservation() throws Exception {
        // Arrange
        Reservation r1 = new Reservation();
        r1.setId("1");
        when(reservationService.getReservationById("1")).thenReturn(r1);

        // Act & Assert
        mockMvc.perform(get("/api/reservations/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("1"));
    }
}
