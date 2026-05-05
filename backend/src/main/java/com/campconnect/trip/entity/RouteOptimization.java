package com.campconnect.trip.entity;

import java.math.BigDecimal;
import java.util.UUID;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Document(collection = "route_optimizations")
public class RouteOptimization {
    @Id
    private String id;
    private String tripId;
    private int totalDuration; // minutes
    private BigDecimal totalCost;

    public RouteOptimization(String tripId, int totalDuration, BigDecimal totalCost) {
        this.id = UUID.randomUUID().toString();
        this.tripId = tripId;
        this.totalDuration = totalDuration;
        this.totalCost = totalCost;
    }
}
