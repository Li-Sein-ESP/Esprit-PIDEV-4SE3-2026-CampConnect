package com.campconnect.controller;

import com.campconnect.dto.GroupInviteDetailDto;
import com.campconnect.model.GroupInvite;
import com.campconnect.model.GroupInviteStatus;
import com.campconnect.service.IGroupInviteService;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(GroupInviteController.class)
@AutoConfigureMockMvc(addFilters = false)
class GroupInviteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private IGroupInviteService groupInviteService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void createInvite_ShouldReturnOk() throws Exception {
        // Arrange
        GroupInvite invite = new GroupInvite();
        invite.setFromUserId("user-A");
        invite.setToUserId("user-B");

        when(groupInviteService.createInvite(any(GroupInvite.class))).thenReturn(invite);

        // Act & Assert
        mockMvc.perform(post("/api/group-invites")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invite)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fromUserId").value("user-A"));
    }

    @Test
    void acceptInvite_ShouldReturnUpdated() throws Exception {
        // Arrange
        GroupInvite accepted = new GroupInvite();
        accepted.setId("invite-1");
        accepted.setStatus(GroupInviteStatus.ACCEPTED);

        when(groupInviteService.acceptInvite("invite-1")).thenReturn(accepted);

        // Act & Assert
        mockMvc.perform(patch("/api/group-invites/invite-1/accept"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACCEPTED"));
    }

    @Test
    void getInviteDetailsForUser_ShouldReturnList() throws Exception {
        // Arrange
        GroupInviteDetailDto detail = new GroupInviteDetailDto();
        detail.setId("invite-1");
        
        when(groupInviteService.getInviteDetailsForUser("user-1")).thenReturn(Collections.singletonList(detail));

        // Act & Assert
        mockMvc.perform(get("/api/group-invites/user/user-1/details"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("invite-1"));
    }
}
