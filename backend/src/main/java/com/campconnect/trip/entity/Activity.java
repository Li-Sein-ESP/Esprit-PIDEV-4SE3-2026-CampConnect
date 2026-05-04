package com.campconnect.trip.entity;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.campconnect.model.common.LocationPoint;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Document(collection = "activities")
public class Activity {
    @Id
    private String id;
    private String itineraryId;
    private String name;
    private String description;
    private LocationPoint location;
    private Instant startTime;
    private Instant endTime;
    private BigDecimal cost;

    public Activity(String itineraryId, String name, String description) {
        this.id = UUID.randomUUID().toString();
        this.itineraryId = itineraryId;
        this.name = name;
        this.description = description;
    }
}
