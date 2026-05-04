package com.campconnect.delivery.controller;

import com.campconnect.common.PagedResponse;
import com.campconnect.delivery.dto.DeliveryRequest;
import com.campconnect.delivery.dto.DeliveryResponse;
import com.campconnect.delivery.dto.DriverProfileStatsResponse;
import com.campconnect.delivery.dto.EarningsResponse;
import com.campconnect.delivery.model.DeliveryPriority;
import com.campconnect.delivery.model.DeliveryStatus;
import com.campconnect.delivery.service.DeliveryService;
import com.campconnect.exception.ResourceNotFoundException;
import com.campconnect.service.UserDetailsImpl;
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
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DeliveryController.class)
@AutoConfigureMockMvc(addFilters = false)
class DeliveryControllerTest {

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
    private DeliveryService deliveryService;

    @Test
    void getAll_ShouldReturnPagedResponse() throws Exception {
        DeliveryResponse response = new DeliveryResponse();
        ReflectionTestUtils.setField(response, "id", "delivery-1");
        PagedResponse<DeliveryResponse> paged = new PagedResponse<>();
        ReflectionTestUtils.setField(paged, "content", List.of(response));
        ReflectionTestUtils.setField(paged, "page", 0);
        ReflectionTestUtils.setField(paged, "size", 10);
        ReflectionTestUtils.setField(paged, "totalElements", 1L);
        ReflectionTestUtils.setField(paged, "totalPages", 1);
        ReflectionTestUtils.setField(paged, "last", true);

        when(deliveryService.findAll(any(), any(), any())).thenReturn(paged);

        mockMvc.perform(get("/api/deliveries"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value("delivery-1"));
    }

    @Test
    void getById_ShouldReturnDelivery() throws Exception {
        DeliveryResponse response = new DeliveryResponse();
        ReflectionTestUtils.setField(response, "id", "delivery-1");
        ReflectionTestUtils.setField(response, "status", DeliveryStatus.CREATED);

        when(deliveryService.findById("delivery-1")).thenReturn(response);

        mockMvc.perform(get("/api/deliveries/delivery-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("delivery-1"))
                .andExpect(jsonPath("$.status").value("CREATED"));
    }

    @Test
    void getById_ShouldReturn404_WhenNotFound() throws Exception {
        when(deliveryService.findById("missing"))
                .thenThrow(new ResourceNotFoundException("Delivery", "id", "missing"));

        mockMvc.perform(get("/api/deliveries/missing"))
                .andExpect(status().isNotFound());
    }

    @Test
    void create_ShouldReturn201_WhenValidRequest() throws Exception {
        DeliveryRequest request = new DeliveryRequest();
        ReflectionTestUtils.setField(request, "rentalId", "rental-1");
        ReflectionTestUtils.setField(request, "driverId", "mock-driver-1");
        ReflectionTestUtils.setField(request, "pickupAddress", "Camp Base");
        ReflectionTestUtils.setField(request, "deliveryAddress", "Forest Trail");
        ReflectionTestUtils.setField(request, "scheduledDate", LocalDate.now().plusDays(1));
        ReflectionTestUtils.setField(request, "priority", DeliveryPriority.NORMAL);

        DeliveryResponse response = new DeliveryResponse();
        ReflectionTestUtils.setField(response, "id", "delivery-1");

        when(deliveryService.create(any(DeliveryRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/deliveries")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("delivery-1"));
    }

    @Test
    void updateStatus_ShouldReturnUpdatedDelivery() throws Exception {
        DeliveryResponse response = new DeliveryResponse();
        ReflectionTestUtils.setField(response, "id", "delivery-1");
        ReflectionTestUtils.setField(response, "status", DeliveryStatus.PENDING);

        when(deliveryService.updateStatus("delivery-1", DeliveryStatus.PENDING)).thenReturn(response);

        mockMvc.perform(patch("/api/deliveries/delivery-1/status").param("status", "PENDING"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    void getEarnings_ShouldReturnEarnings() throws Exception {
        UserDetailsImpl principal = new UserDetailsImpl("driver-1", "driver", "d@test.com", "pass",
                List.of(), null);
        EarningsResponse response = new EarningsResponse();
        ReflectionTestUtils.setField(response, "totalEarnings", new BigDecimal("45.00"));

        when(deliveryService.calculateEarnings(anyString())).thenReturn(response);
        setAuthenticatedPrincipal(principal);

        mockMvc.perform(get("/api/deliveries/earnings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalEarnings").value(45.00));
    }

    @Test
    void getProfileStats_ShouldReturnDriverStats() throws Exception {
        UserDetailsImpl principal = new UserDetailsImpl("driver-1", "driver", "d@test.com", "pass",
                List.of(), null);
        DriverProfileStatsResponse response = new DriverProfileStatsResponse();
        ReflectionTestUtils.setField(response, "totalDeliveries", 20L);
        ReflectionTestUtils.setField(response, "activeJobs", 2L);

        when(deliveryService.getDriverProfileStats("driver-1")).thenReturn(response);
        setAuthenticatedPrincipal(principal);

        mockMvc.perform(get("/api/deliveries/profile-stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalDeliveries").value(20))
                .andExpect(jsonPath("$.activeJobs").value(2));
    }

    @Test
    void delete_ShouldReturn204() throws Exception {
        doNothing().when(deliveryService).softDelete("delivery-1");

        mockMvc.perform(delete("/api/deliveries/delivery-1"))
                .andExpect(status().isNoContent());
    }
}
