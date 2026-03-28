package com.campconnect.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "trips")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Trip {
    
    @Id
    private String id;
    
    private String name;
    private String description;
    private String destination;
    private LocalDate startDate;
    private LocalDate endDate;
    private String creatorId;
    private List<String> participants = new ArrayList<>();
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    private Double latitude;
    private Double longitude;
    private String difficulty;
    private Integer maxParticipants;
}
