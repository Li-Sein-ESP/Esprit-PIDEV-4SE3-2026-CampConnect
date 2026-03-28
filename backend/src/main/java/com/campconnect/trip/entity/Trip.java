package com.campconnect.trip.entity;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.campconnect.trip.enums.DifficultyLevel;
import com.campconnect.trip.enums.TripStatus;
import com.campconnect.model.common.LocationPoint;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Document(collection = "trip_itineraries_main")
public class Trip {
    @Id
    private String id;
    private String title;
    private LocationPoint destination;
    private Instant startDate;
    private Instant endDate;
    private DifficultyLevel difficulty;
    private BigDecimal totalBudget;
    private TripStatus status;
    private int participants;
    private String userId;
    private String comfortLevel;
    private String imageUrl; // For displaying the template visually
    private boolean template = false; // To differentiate user trips from admin templates
    private java.util.List<String> activities = new java.util.ArrayList<>();
    private String routeOptimizationId;
    private java.util.List<String> itineraryIds = new java.util.ArrayList<>();
    private java.util.List<String> transportIds = new java.util.ArrayList<>();

    public Trip(String title, LocationPoint destination, Instant startDate, Instant endDate, DifficultyLevel difficulty,
            BigDecimal totalBudget, TripStatus status) {
        this.id = UUID.randomUUID().toString();
        this.title = title;
        this.destination = destination;
        this.startDate = startDate;
        this.endDate = endDate;
        this.difficulty = difficulty;
        this.totalBudget = totalBudget;
        this.status = status;
    }
}
