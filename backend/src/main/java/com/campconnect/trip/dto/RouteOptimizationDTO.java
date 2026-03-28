package com.campconnect.trip.dto;

import java.math.BigDecimal;
import lombok.Data;

@Data
public class RouteOptimizationDTO {
    private String id;

    @jakarta.validation.constraints.NotBlank(message = "Trip ID is required")
    private String tripId;

    @jakarta.validation.constraints.PositiveOrZero(message = "Total duration cannot be negative")
    private int totalDuration;

    @jakarta.validation.constraints.PositiveOrZero(message = "Total cost cannot be negative")
    private BigDecimal totalCost;
}
