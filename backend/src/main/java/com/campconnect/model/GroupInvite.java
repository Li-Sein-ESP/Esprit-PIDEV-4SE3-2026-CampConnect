package com.campconnect.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "group_invites")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupInvite {
    @Id
    private String id;

    private String tripIntentId;

    private String groupId;

    private String fromUserId;

    private String toUserId;

    private GroupInviteStatus status;

    private String message;

    private LocalDateTime expiresAt;

    @CreatedDate
    private LocalDateTime createdAt;
}
