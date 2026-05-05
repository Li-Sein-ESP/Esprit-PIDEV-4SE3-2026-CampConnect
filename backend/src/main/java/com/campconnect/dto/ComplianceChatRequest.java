package com.campconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComplianceChatRequest {
    private String campsiteId;
    private String userMessage;
    private List<MessageDTO> conversationHistory;
}
