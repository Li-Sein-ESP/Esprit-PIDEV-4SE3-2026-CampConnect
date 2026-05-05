package com.campconnect.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripDTO {
    private String id;
    private String name;
    private String notes;
    
    @NotBlank(message = "Destination is required")
    private String destination;
    
    @NotBlank(message = "Category is required")
    private String categoryName;
    
    private String difficulty;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;
    private String creatorId;
    private String groupId;
}
