package com.campconnect.controller;

import com.campconnect.dto.GroupDetailDTO;
import com.campconnect.dto.GroupDTO;
import com.campconnect.model.Group;
import com.campconnect.service.IGroupService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(GroupController.class)
@AutoConfigureMockMvc(addFilters = false)
class GroupControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private IGroupService groupService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void createGroup_ShouldReturnCreated() throws Exception {
        // Arrange
        GroupDTO dto = new GroupDTO();
        dto.setName("New Group");
        dto.setCreatorUserId("user-1");

        Group created = Group.builder().id("group-1").name("New Group").build();
        when(groupService.createGroup(any(Group.class))).thenReturn(created);

        // Act & Assert
        mockMvc.perform(post("/api/groups")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("group-1"))
                .andExpect(jsonPath("$.name").value("New Group"));
    }

    @Test
    void getGroupById_ShouldReturnGroup() throws Exception {
        // Arrange
        Group group = Group.builder().id("group-1").name("Test Group").build();
        when(groupService.getGroupById("group-1")).thenReturn(group);

        // Act & Assert
        mockMvc.perform(get("/api/groups/group-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("group-1"));
    }

    @Test
    void getGroupDetail_ShouldReturnDetail() throws Exception {
        // Arrange
        GroupDetailDTO detail = new GroupDetailDTO();
        detail.setId("group-1");
        detail.setMembers(Collections.emptyList());
        
        when(groupService.getGroupDetail("group-1")).thenReturn(detail);

        // Act & Assert
        mockMvc.perform(get("/api/groups/group-1/detail"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("group-1"));
    }

    @Test
    void getGroupByTripId_ShouldReturn404_WhenNotFound() throws Exception {
        // Arrange
        when(groupService.getGroupByTripId("unknown")).thenReturn(Optional.empty());

        // Act & Assert
        mockMvc.perform(get("/api/groups/trip/unknown"))
                .andExpect(status().isNotFound());
    }
}
