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
    private String severity;
    private String location;
    private Double latitude;
    private Double longitude;
    private String tripId;
    private String tripName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean active;
}
