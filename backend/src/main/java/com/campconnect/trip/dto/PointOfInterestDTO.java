package com.campconnect.trip.dto;

import com.campconnect.trip.enums.POICategory;
import com.campconnect.model.common.LocationPoint;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
public class PointOfInterestDTO {
    private String id;

    @NotBlank(message = "Itinerary ID is required")
    private String itineraryId;

    @NotBlank(message = "POI name is required")
    private String name;

    private LocationPoint location;

    @NotNull(message = "Category is required")
    private POICategory category;

    private String description;
    private String imageUrl;
}
