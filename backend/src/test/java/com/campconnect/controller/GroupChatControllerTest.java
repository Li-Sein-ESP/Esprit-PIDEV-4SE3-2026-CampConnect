package com.campconnect.controller;

import com.campconnect.model.GroupMessage;
import com.campconnect.repository.GroupMessageRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(GroupChatController.class)
@AutoConfigureMockMvc(addFilters = false)
class GroupChatControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private GroupMessageRepository groupMessageRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void getMessages_ShouldReturnList() throws Exception {
        // Arrange
        GroupMessage msg = new GroupMessage();
        msg.setId("msg-1");
        msg.setGroupId("group-1");
        msg.setContent("Hello");
        msg.setCreatedAt(LocalDateTime.now());

        when(groupMessageRepository.findByGroupIdOrderByCreatedAtAsc("group-1"))
                .thenReturn(Collections.singletonList(msg));

        // Act & Assert
        mockMvc.perform(get("/api/group-chat/group-1/messages"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].content").value("Hello"));
    }

    @Test
    void sendMessage_ShouldReturnSavedMessage() throws Exception {
        // Arrange
        GroupMessage msg = new GroupMessage();
        msg.setGroupId("group-1");
        msg.setContent("New Message");
        msg.setSenderUserId("user-1");

        when(groupMessageRepository.save(any(GroupMessage.class))).thenReturn(msg);

        // Act & Assert
        mockMvc.perform(post("/api/group-chat/send")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(msg)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").value("New Message"));
    }
}
