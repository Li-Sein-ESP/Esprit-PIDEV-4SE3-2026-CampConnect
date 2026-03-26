package com.campconnect.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "incidents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Incident {

    @Id
    private String id;

    private String title;
    private String description;
    private String level;
    private String regionName;
    private double latitude;
    private double longitude;
    private String reporterId;
    private LocalDateTime reportedAt = LocalDateTime.now();
    @DBRef
    private Trip trip;

    private String status = "pending"; // pending, review, resolved, rejected
}
