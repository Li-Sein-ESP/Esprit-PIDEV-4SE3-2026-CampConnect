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
    private String message;
    private AlertSeverity severity;
    private LocalDateTime createdAt;
    private String tripId;
}
