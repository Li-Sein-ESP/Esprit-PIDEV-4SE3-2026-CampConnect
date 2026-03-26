package com.campconnect.trip.entity;

import java.util.UUID;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.campconnect.model.common.LocationPoint;
import com.campconnect.transport.enums.TransportMode;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Document(collection = "route_segments")
public class RouteSegment {
    @Id
    private String id;
    private String itineraryId;
    private java.util.List<String> safetyAlertIds = new java.util.ArrayList<>();
    private LocationPoint startLocation;
    private LocationPoint endLocation;
    private int estimatedTime; // in minutes
    private TransportMode mode;

    public RouteSegment(String itineraryId, LocationPoint startLocation, LocationPoint endLocation,
            int estimatedTime, TransportMode mode) {
        this.id = UUID.randomUUID().toString();
        this.itineraryId = itineraryId;
        this.startLocation = startLocation;
        this.endLocation = endLocation;
        this.estimatedTime = estimatedTime;
        this.mode = mode;
    }
}
