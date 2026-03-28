package com.campconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripDTO {
    private String id;
    private String name;
    private String description;
    private String destination;
    private String startDate;
    private String endDate;
    private String creatorId;
    private String status;
    private LocalDateTime createdAt;
}
