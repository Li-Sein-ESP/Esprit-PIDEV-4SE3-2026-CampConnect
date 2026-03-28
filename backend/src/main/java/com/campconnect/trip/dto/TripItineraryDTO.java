package com.campconnect.trip.dto;

import lombok.Data;

@Data
public class TripItineraryDTO {
    private String id;

    @jakarta.validation.constraints.NotBlank(message = "Trip ID is required")
    private String tripId;

    @jakarta.validation.constraints.Min(value = 1, message = "Day number must be at least 1")
    private int dayNumber;

    @jakarta.validation.constraints.NotBlank(message = "Daily description is required")
    private String dailyDescription;

    private java.util.List<String> activityIds = new java.util.ArrayList<>();
    private java.util.List<String> poiIds = new java.util.ArrayList<>();
    private java.util.List<String> routeSegmentIds = new java.util.ArrayList<>();
}
