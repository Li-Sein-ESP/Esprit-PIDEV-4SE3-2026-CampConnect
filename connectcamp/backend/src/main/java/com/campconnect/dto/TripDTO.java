package com.campconnect.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import com.campconnect.enums.DifficultyLevel;
import com.campconnect.enums.TripStatus;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripDTO {
    private String id;
    
    @NotBlank(message = "Destination is required")
    private String destination;
    
    @NotBlank(message = "Category is required")
    private String categoryName;
    
    private DifficultyLevel difficulty;
    private TripStatus status;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String creatorId;
}
