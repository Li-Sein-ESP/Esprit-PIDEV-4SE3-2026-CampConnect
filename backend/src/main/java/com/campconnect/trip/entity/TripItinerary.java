package com.campconnect.trip.entity;

import java.util.UUID;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Document(collection = "trip_itineraries")
public class TripItinerary {
    @Id
    private String id;
    private String tripId;
    private int dayNumber;
    private String dailyDescription;
    private java.util.List<String> activityIds = new java.util.ArrayList<>();
    private java.util.List<String> poiIds = new java.util.ArrayList<>();
    private java.util.List<String> routeSegmentIds = new java.util.ArrayList<>();

    public TripItinerary(String tripId, int dayNumber, String dailyDescription) {
        this.id = UUID.randomUUID().toString();
        this.tripId = tripId;
        this.dayNumber = dayNumber;
        this.dailyDescription = dailyDescription;
    }
}
