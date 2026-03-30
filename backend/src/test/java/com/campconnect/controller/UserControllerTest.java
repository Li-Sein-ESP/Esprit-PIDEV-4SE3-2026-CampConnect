package com.campconnect.controller;

import com.campconnect.config.JwtUtils;
import com.campconnect.model.User;
import com.campconnect.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private com.campconnect.service.UserService userService;

    @MockBean
    private JwtUtils jwtUtils;

    @Test
    void getUserById_ShouldReturnUser() throws Exception {
        // Arrange
        com.campconnect.dto.UserProfileResponse resp = new com.campconnect.dto.UserProfileResponse();
        resp.setId("user-1");
        resp.setUsername("testuser");
        when(userService.getProfile("user-1")).thenReturn(resp);

        // Act & Assert
        mockMvc.perform(get("/api/users/user-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("user-1"))
                .andExpect(jsonPath("$.username").value("testuser"));
    }

    @Test
    void getUserById_ShouldReturn404() throws Exception {
        // Arrange
        when(userService.getProfile("unknown")).thenThrow(new RuntimeException("not found"));

        // Act & Assert
        mockMvc.perform(get("/api/users/unknown"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getUserByUsername_ShouldReturnUser() throws Exception {
        // Arrange
        com.campconnect.dto.UserProfileResponse resp = new com.campconnect.dto.UserProfileResponse();
        resp.setUsername("testuser");
        when(userService.getProfileByUsername("testuser")).thenReturn(resp);

        // Act & Assert
        mockMvc.perform(get("/api/users/username/testuser"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("testuser"));
    }
}
