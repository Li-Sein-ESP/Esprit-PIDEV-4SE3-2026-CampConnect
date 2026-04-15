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
    private IncidentType type;
    private IncidentSeverity severity;
    private String description;
    private LocalDateTime reportedAt;
    private String tripId;
}
