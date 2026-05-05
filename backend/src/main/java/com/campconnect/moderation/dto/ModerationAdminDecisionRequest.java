package com.campconnect.moderation.dto;

import lombok.Data;

@Data
public class ModerationAdminDecisionRequest {
    private String note;
    private Boolean banUser;
    private String adminUserId;
}
