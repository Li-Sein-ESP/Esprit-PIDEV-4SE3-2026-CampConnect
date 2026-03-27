package com.campconnect.dto;

import java.time.LocalDateTime;

import com.campconnect.model.GroupInviteStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupInviteDto {
    private String id;
    private String tripIntentId;
    private String groupId;
    private String fromUserId;
    private String toUserId;
    private GroupInviteStatus status;
    private String message;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
}
