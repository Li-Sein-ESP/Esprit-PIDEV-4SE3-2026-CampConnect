package com.campconnect.controller;

import com.campconnect.dto.ChangePasswordRequest;
import com.campconnect.dto.UpdateProfileRequest;
import com.campconnect.dto.UserProfileResponse;
import com.campconnect.dto.UserStatsResponse;
import com.campconnect.service.UserDetailsImpl;
import com.campconnect.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
class UserControllerTest {

    private static void setAuthenticatedPrincipal(UserDetailsImpl principal) {
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities()));
        SecurityContextHolder.setContext(context);
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserService userService;

    @Test
    void getMe_ShouldReturnProfile() throws Exception {
        UserDetailsImpl principal = new UserDetailsImpl("user-1", "camper", "camper@test.com", "pass",
                List.of(), null);
        UserProfileResponse profile = new UserProfileResponse();
        ReflectionTestUtils.setField(profile, "id", "user-1");
        ReflectionTestUtils.setField(profile, "username", "camper");

        when(userService.getProfile("user-1")).thenReturn(profile);
        setAuthenticatedPrincipal(principal);

        mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("user-1"))
                .andExpect(jsonPath("$.username").value("camper"));
    }

    @Test
    void updateMe_ShouldReturnUpdatedProfile() throws Exception {
        UserDetailsImpl principal = new UserDetailsImpl("user-1", "camper", "camper@test.com", "pass",
                List.of(), null);
        UpdateProfileRequest request = new UpdateProfileRequest();
        ReflectionTestUtils.setField(request, "name", "Updated Camper");

        UserProfileResponse profile = new UserProfileResponse();
        ReflectionTestUtils.setField(profile, "id", "user-1");
        ReflectionTestUtils.setField(profile, "name", "Updated Camper");

        when(userService.updateProfile(eq("user-1"), any(UpdateProfileRequest.class)))
                .thenReturn(profile);
        setAuthenticatedPrincipal(principal);

        mockMvc.perform(put("/api/users/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Camper"));
    }

    @Test
    void changePassword_ShouldReturnSuccessMessage() throws Exception {
        UserDetailsImpl principal = new UserDetailsImpl("user-1", "camper", "camper@test.com", "pass",
                List.of(), null);
        ChangePasswordRequest request = new ChangePasswordRequest();
        ReflectionTestUtils.setField(request, "currentPassword", "old-pass");
        ReflectionTestUtils.setField(request, "newPassword", "new-pass");
        setAuthenticatedPrincipal(principal);

        mockMvc.perform(put("/api/users/me/password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Password updated successfully"));
    }

    @Test
    void getMyStats_ShouldReturnUserStats() throws Exception {
        UserDetailsImpl principal = new UserDetailsImpl("user-1", "camper", "camper@test.com", "pass",
                List.of(), null);
        UserStatsResponse stats = new UserStatsResponse();
        ReflectionTestUtils.setField(stats, "campsitesVisited", 5L);
        ReflectionTestUtils.setField(stats, "gearRented", 3L);

        when(userService.getUserStats("user-1")).thenReturn(stats);
        setAuthenticatedPrincipal(principal);

        mockMvc.perform(get("/api/users/me/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.campsitesVisited").value(5))
                .andExpect(jsonPath("$.gearRented").value(3));
    }
}
