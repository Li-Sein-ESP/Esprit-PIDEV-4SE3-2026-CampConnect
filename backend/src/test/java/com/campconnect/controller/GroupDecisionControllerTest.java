package com.campconnect.controller;

<<<<<<< HEAD
import com.campconnect.dto.GroupDecisionDto;
=======
import com.campconnect.dto.GroupDecisionDTO;
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
import com.campconnect.dto.VoteRequest;
import com.campconnect.model.GroupDecision;
import com.campconnect.service.IGroupDecisionService;
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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(GroupDecisionController.class)
@AutoConfigureMockMvc(addFilters = false)
class GroupDecisionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private IGroupDecisionService groupDecisionService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
<<<<<<< HEAD
    void createDecision_ShouldReturnCreated() throws Exception {
        // Arrange
        GroupDecisionDto dto = new GroupDecisionDto();
        dto.setQuestion("Quoi manger ?");
        dto.setGroupId("group-1");

=======
    void createDecision_Success() throws Exception {
        GroupDecisionDTO dto = new GroupDecisionDTO();
        dto.setGroupId("group-1");
        dto.setQuestion("Lunch Place");
        dto.setOptions(java.util.List.of("Pizza", "Burgers"));
        dto.setType(com.campconnect.model.GroupDecisionType.ACTIVITY);
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
        GroupDecision created = GroupDecision.builder().id("dec-1").question("Quoi manger ?").build();
        when(groupDecisionService.createDecision(any(GroupDecision.class))).thenReturn(created);

        // Act & Assert
        mockMvc.perform(post("/api/group-decisions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("dec-1"));
    }

    @Test
    void vote_ShouldReturnOk() throws Exception {
        // Arrange
        VoteRequest voteRequest = new VoteRequest();
        voteRequest.setUserId("user-1");
        voteRequest.setOption("Pizza");

        GroupDecision updated = GroupDecision.builder().id("dec-1").build();
        when(groupDecisionService.vote(eq("dec-1"), eq("user-1"), eq("Pizza"))).thenReturn(updated);

        // Act & Assert
        mockMvc.perform(patch("/api/group-decisions/dec-1/vote")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(voteRequest)))
                .andExpect(status().isOk());
    }

    @Test
    void getDecisionsForGroup_ShouldReturnList() throws Exception {
        // Arrange
        GroupDecision dec = GroupDecision.builder().id("dec-1").build();
        when(groupDecisionService.getDecisionsForGroup("group-1")).thenReturn(Collections.singletonList(dec));

        // Act & Assert
        mockMvc.perform(get("/api/group-decisions/group/group-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("dec-1"));
    }
}
