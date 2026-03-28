package com.campconnect.transport.entity;

import java.time.Instant;
import java.util.UUID;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.campconnect.transport.enums.AlertSeverity;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Document(collection = "safety_alerts")
public class SafetyAlert {
    @Id
    private String id;
    private String routeSegmentId;
    private String title;
    private String description;
    private AlertSeverity severity;
    private Instant createdAt;

    public SafetyAlert(String routeSegmentId, String title, String description, AlertSeverity severity) {
        this.id = UUID.randomUUID().toString();
        this.routeSegmentId = routeSegmentId;
        this.title = title;
        this.description = description;
        this.severity = severity;
        this.createdAt = Instant.now();
    }
}
