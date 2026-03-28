package com.campconnect.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "incidents")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Incident {
    @Id
    private String id;
    private String title;
    private String description;
    private String severity;
    private String tripId;
    private String reporterId;
    private String location;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String status;
}
