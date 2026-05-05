package com.campconnect.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "moderation_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModerationLog {

    @Id
    private String id;

    private String userId;
    private String username;
    private String entityId;      // ID du commentaire ou post supprimé
    private String entityType;    // "COMMENT" ou "POST"
    private String originalContent;
    private String reason;        // "PROFANITY_DETECTED"
    private String actionTaken;   // "AUTO_DELETED"
    
    private LocalDateTime createdAt;
}
