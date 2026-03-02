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

    private String message;

    private AlertSeverity severity;

    private LocalDateTime createdAt = LocalDateTime.now();

    @DBRef
    private Trip trip;
}
