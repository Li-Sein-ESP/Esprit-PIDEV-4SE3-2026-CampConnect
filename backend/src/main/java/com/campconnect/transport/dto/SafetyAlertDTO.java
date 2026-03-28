package com.campconnect.transport.dto;

import java.time.Instant;
import com.campconnect.transport.enums.AlertSeverity;
import lombok.Data;

@Data
public class SafetyAlertDTO {
    private String id;
    private String routeSegmentId;
    private String title;
    private String description;
    private AlertSeverity severity;
    private Instant createdAt;
}
