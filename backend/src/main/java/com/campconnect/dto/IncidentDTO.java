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
    private LocalDateTime reportedAt;
    private String tripId;
}
