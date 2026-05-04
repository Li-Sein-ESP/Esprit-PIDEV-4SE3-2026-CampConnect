package com.campconnect.trip.entity;

import java.util.UUID;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.campconnect.trip.enums.POICategory;
import com.campconnect.model.common.LocationPoint;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Document(collection = "points_of_interest")
public class PointOfInterest {
    @Id
    private String id;
    private String itineraryId;
    private String name;
    private String description;
    private LocationPoint location;
    private POICategory category;
    private String imageUrl;

    public PointOfInterest(String itineraryId, String name, LocationPoint location, POICategory category) {
        this.id = UUID.randomUUID().toString();
        this.itineraryId = itineraryId;
        this.name = name;
        this.location = location;
        this.category = category;
    }
}
