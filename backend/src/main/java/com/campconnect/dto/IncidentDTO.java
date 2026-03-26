package com.campconnect.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
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
    private String tripId;
    private String status; // Pending, Review, Resolved, Rejected
}
