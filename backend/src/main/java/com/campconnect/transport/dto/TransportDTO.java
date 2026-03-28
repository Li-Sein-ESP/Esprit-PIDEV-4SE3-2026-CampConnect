package com.campconnect.transport.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Positive;
import com.campconnect.transport.enums.TransportMode;

@Data
public class TransportDTO {
    private String id;

    private String tripId;

    private String routeSegmentId;

    @NotNull(message = "Mode of transport is required")
    private TransportMode mode;

    @NotNull(message = "Cost is required")
    @PositiveOrZero(message = "Cost cannot be negative")
    private java.math.BigDecimal cost;

    @Positive(message = "Duration must be positive")
    private int duration;

    @NotBlank(message = "Provider is required")
    private String provider;

    private String imageUrl;
}
