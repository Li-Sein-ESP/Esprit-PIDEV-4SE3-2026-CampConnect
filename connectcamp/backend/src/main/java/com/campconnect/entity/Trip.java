package com.campconnect.entity;

import com.campconnect.model.User;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.campconnect.enums.DifficultyLevel;
import com.campconnect.enums.TripStatus;
import java.time.LocalDateTime;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.FutureOrPresent;

@Document(collection = "trips")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Trip {
    @Id
    private String id;
    
    @NotBlank(message = "Destination is required")
    private String destination;
    
    @NotNull(message = "Difficulty is required")
    private DifficultyLevel difficulty;
    
    @NotNull(message = "Status is required")
    private TripStatus status;
    
    @NotNull(message = "Start date is required")
    @FutureOrPresent(message = "Start date must be in the future")
    private LocalDateTime startDate;
    
    @NotNull(message = "End date is required")
    private LocalDateTime endDate;

    @DBRef
    private Category category;

    @DBRef
    private User creator;
}
