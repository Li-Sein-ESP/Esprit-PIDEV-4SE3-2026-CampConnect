package com.campconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripDTO {
    private String id;
    private String name;
    private String description;
    private String notes;
    private String destination;
    private String location;
    private LocalDate startDate;
    private LocalDate endDate;
    private String difficulty;
    private String groupId;
    private String creatorId;
    private String status;
    private LocalDateTime createdAt;
}
