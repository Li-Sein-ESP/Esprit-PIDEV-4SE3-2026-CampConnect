package com.campconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class IncidentDTO {
    private String id;
    private String title;
    private String description;
    private String severity;
    private String level;
    private String regionName;
    private Double latitude;
    private Double longitude;
    private String tripId;
    private String reporterId;
    private String location;
    private LocalDateTime createdAt;
    private LocalDateTime reportedAt;
    private String status;
}
