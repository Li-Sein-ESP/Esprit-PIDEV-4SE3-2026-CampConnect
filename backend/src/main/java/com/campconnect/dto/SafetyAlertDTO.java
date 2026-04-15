package com.campconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SafetyAlertDTO {
    private String id;
    private String title;
    private String description;
    private String type;
    private String severity;
    private String status;
    private String locationName;
    private String regionName;
    private String tripId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
