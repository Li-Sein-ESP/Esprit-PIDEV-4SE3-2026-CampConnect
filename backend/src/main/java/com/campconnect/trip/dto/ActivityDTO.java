package com.campconnect.trip.dto;

import java.math.BigDecimal;
import java.time.Instant;
import com.campconnect.model.common.LocationPoint;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;

@Data
public class ActivityDTO {
    private String id;

    @NotBlank(message = "Itinerary ID is required")
    private String itineraryId;

    @NotBlank(message = "Activity name is required")
    private String name;

    @NotBlank(message = "Description is required")
    private String description;

    private LocationPoint location;
    private Instant startTime;
    private Instant endTime;

    @PositiveOrZero(message = "Cost cannot be negative")
    private BigDecimal cost;
}
