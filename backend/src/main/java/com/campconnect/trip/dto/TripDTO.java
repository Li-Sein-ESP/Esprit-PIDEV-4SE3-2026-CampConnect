package com.campconnect.trip.dto;

import java.math.BigDecimal;
import java.time.Instant;
import com.campconnect.trip.enums.DifficultyLevel;
import com.campconnect.trip.enums.TripStatus;
import com.campconnect.model.common.LocationPoint;
import lombok.Data;

@Data
public class TripDTO {
    private String id;

    @jakarta.validation.constraints.NotBlank(message = "Title is required")
    @jakarta.validation.constraints.Size(min = 3, max = 100, message = "Title must be between 3 and 100 characters")
    private String title;

    private LocationPoint destination;

    @jakarta.validation.constraints.NotNull(message = "Start date is required")
    private Instant startDate;

    @jakarta.validation.constraints.NotNull(message = "End date is required")
    private Instant endDate;

    @jakarta.validation.constraints.NotNull(message = "Difficulty level is required")
    private DifficultyLevel difficulty;

    @jakarta.validation.constraints.NotNull(message = "Total budget is required")
    @jakarta.validation.constraints.PositiveOrZero(message = "Budget must be a positive number or zero")
    private BigDecimal totalBudget;

    @jakarta.validation.constraints.NotNull(message = "Status is required")
    private TripStatus status;

    @jakarta.validation.constraints.Min(value = 1, message = "Participants must be at least 1")
    private int participants;

    private String comfortLevel;
    private String imageUrl;
    private boolean template;

    private java.util.List<String> activities = new java.util.ArrayList<>();

    @jakarta.validation.constraints.NotBlank(message = "User ID is required")
    private String userId;
    private String routeOptimizationId;
    private java.util.List<String> itineraryIds = new java.util.ArrayList<>();
    private java.util.List<String> transportIds = new java.util.ArrayList<>();
}
