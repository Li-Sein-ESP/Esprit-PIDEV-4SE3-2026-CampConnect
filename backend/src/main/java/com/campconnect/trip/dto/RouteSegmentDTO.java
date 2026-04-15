package com.campconnect.trip.dto;

import com.campconnect.model.common.LocationPoint;
import com.campconnect.transport.enums.TransportMode;
import lombok.Data;

@Data
public class RouteSegmentDTO {
    private String id;

    @jakarta.validation.constraints.NotBlank(message = "Itinerary ID is required")
    private String itineraryId;

    private java.util.List<String> safetyAlertIds = new java.util.ArrayList<>();

    @jakarta.validation.constraints.NotNull(message = "Start location is required")
    private LocationPoint startLocation;

    @jakarta.validation.constraints.NotNull(message = "End location is required")
    private LocationPoint endLocation;

    @jakarta.validation.constraints.Positive(message = "Estimated time must be positive")
    private int estimatedTime;

    @jakarta.validation.constraints.NotNull(message = "Transport mode is required")
    private TransportMode mode;
}
