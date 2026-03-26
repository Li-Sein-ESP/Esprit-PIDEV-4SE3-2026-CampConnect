package com.campconnect.dto;

import com.campconnect.model.AlertSeverity;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SafetyAlertDTO {
    private String id;
    private String title;
    private String description;
    private String type;
    private AlertSeverity severity;
    private String locationName;
    private String regionName;
    private LocalDateTime createdAt;
    private String tripId;
}
