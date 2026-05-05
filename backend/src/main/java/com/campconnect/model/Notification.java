package com.campconnect.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {
    @Id
    private String id;
    private String userId;
    private String title;
    private String message;
    private String type; // TRANSPORT, ACTIVITY, SYSTEM
    private boolean read = false;
    private LocalDateTime createdAt = LocalDateTime.now();
    private String relatedId; // TripId or ActivityId
}
