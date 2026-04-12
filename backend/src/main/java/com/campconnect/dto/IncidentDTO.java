package com.campconnect.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.campconnect.enums.IncidentType;
import com.campconnect.enums.IncidentSeverity;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class IncidentDTO {
    private String id;
    private String title;
    private String description;
    private String level;
    private String regionName;
    private double latitude;
    private double longitude;
    private String reporterId;
    private LocalDateTime reportedAt;
    private String status;
    private String tripId;
}
