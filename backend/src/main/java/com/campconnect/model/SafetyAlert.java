package com.campconnect.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "safety_alerts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SafetyAlert {

    @Id
    private String id;

    private String title;
    private String description;
    private String type;
    private String severity;
    private String locationName;
    private String regionName;
    private LocalDateTime createdAt = LocalDateTime.now();

    @DBRef
    private Trip trip;
}
