package com.campconnect.gear.controller;

import com.campconnect.common.PagedResponse;
import com.campconnect.gear.dto.GearRequest;
import com.campconnect.gear.dto.GearResponse;
import com.campconnect.gear.dto.ProviderStatsResponse;
import com.campconnect.gear.model.GearStatus;
import com.campconnect.gear.model.ListingType;
import com.campconnect.gear.service.GearService;
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
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(GearController.class)
@AutoConfigureMockMvc(addFilters = false)
class GearControllerTest {

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
    private GearService gearService;

    @Test
    void getAll_ShouldReturnPagedGear() throws Exception {
        GearResponse item = new GearResponse();
        ReflectionTestUtils.setField(item, "id", "gear-1");
        ReflectionTestUtils.setField(item, "status", GearStatus.AVAILABLE);

        PagedResponse<GearResponse> paged = new PagedResponse<>();
        ReflectionTestUtils.setField(paged, "content", List.of(item));
        ReflectionTestUtils.setField(paged, "page", 0);
        ReflectionTestUtils.setField(paged, "size", 12);
        ReflectionTestUtils.setField(paged, "totalElements", 1L);
        ReflectionTestUtils.setField(paged, "totalPages", 1);
        ReflectionTestUtils.setField(paged, "last", true);

        when(gearService.findAll(any(), any(), any())).thenReturn(paged);

        mockMvc.perform(get("/api/gear"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value("gear-1"));
    }

    @Test
    void getById_ShouldReturnGear() throws Exception {
        GearResponse response = new GearResponse();
        ReflectionTestUtils.setField(response, "id", "gear-1");
        ReflectionTestUtils.setField(response, "status", GearStatus.AVAILABLE);

        when(gearService.findById("gear-1")).thenReturn(response);

        mockMvc.perform(get("/api/gear/gear-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("gear-1"))
                .andExpect(jsonPath("$.status").value("AVAILABLE"));
    }

    @Test
    void create_ShouldReturn201() throws Exception {
        UserDetailsImpl principal = new UserDetailsImpl("owner-1", "owner", "o@test.com", "pass",
                List.of(), null);

        GearRequest request = new GearRequest();
        ReflectionTestUtils.setField(request, "name", "Tent");
        ReflectionTestUtils.setField(request, "description", "4-person tent");
        ReflectionTestUtils.setField(request, "category", "Tents");
        ReflectionTestUtils.setField(request, "condition", "Good");
        ReflectionTestUtils.setField(request, "quantity", 3);
        ReflectionTestUtils.setField(request, "listingType", ListingType.FOR_RENT);
        ReflectionTestUtils.setField(request, "dailyPrice", new BigDecimal("20.00"));
        ReflectionTestUtils.setField(request, "imageUrls", List.of("https://img.com/1.jpg"));

        GearResponse response = new GearResponse();
        ReflectionTestUtils.setField(response, "id", "gear-1");

        when(gearService.create(any(GearRequest.class), anyString())).thenReturn(response);
        setAuthenticatedPrincipal(principal);

        mockMvc.perform(post("/api/gear")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("gear-1"));
    }

    @Test
    void update_ShouldReturn200() throws Exception {
        UserDetailsImpl principal = new UserDetailsImpl("owner-1", "owner", "o@test.com", "pass",
                List.of(), null);

        GearRequest request = new GearRequest();
        ReflectionTestUtils.setField(request, "name", "Tent");
        ReflectionTestUtils.setField(request, "description", "updated desc");
        ReflectionTestUtils.setField(request, "category", "Tents");
        ReflectionTestUtils.setField(request, "condition", "Good");
        ReflectionTestUtils.setField(request, "quantity", 2);
        ReflectionTestUtils.setField(request, "listingType", ListingType.FOR_RENT);
        ReflectionTestUtils.setField(request, "dailyPrice", new BigDecimal("22.00"));
        ReflectionTestUtils.setField(request, "imageUrls", List.of("https://img.com/1.jpg"));

        GearResponse response = new GearResponse();
        ReflectionTestUtils.setField(response, "id", "gear-1");

        when(gearService.update(anyString(), any(GearRequest.class), anyString())).thenReturn(response);
        setAuthenticatedPrincipal(principal);

        mockMvc.perform(put("/api/gear/gear-1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("gear-1"));
    }

    @Test
    void delete_ShouldReturn204() throws Exception {
        UserDetailsImpl principal = new UserDetailsImpl("owner-1", "owner", "o@test.com", "pass",
                List.of(), null);

        doNothing().when(gearService).softDelete("gear-1", "owner-1");
        setAuthenticatedPrincipal(principal);

        mockMvc.perform(delete("/api/gear/gear-1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void getProviderStats_ShouldReturnStats() throws Exception {
        UserDetailsImpl principal = new UserDetailsImpl("owner-1", "owner", "o@test.com", "pass",
                List.of(), null);

        ProviderStatsResponse response = new ProviderStatsResponse();
        ReflectionTestUtils.setField(response, "totalProducts", 4);
        ReflectionTestUtils.setField(response, "activeRentals", 2L);

        when(gearService.getProviderStats("owner-1")).thenReturn(response);
        setAuthenticatedPrincipal(principal);

        mockMvc.perform(get("/api/gear/provider/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalProducts").value(4))
                .andExpect(jsonPath("$.activeRentals").value(2));
    }
}
