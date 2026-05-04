package com.campconnect.delivery.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "vehicles")
@Data
@NoArgsConstructor
public class Vehicle {

    @Id
    private String id;

    @Indexed(unique = true)
    private String plateNumber;

    private double capacity;

    @Indexed
    private VehicleStatus status = VehicleStatus.AVAILABLE;

    private String driverId; // Optional: current assigned driver

    // Provider ownership — which DELIVERY_PROVIDER owns this vehicle
    @Indexed
    private String providerId;

    // Vehicle type label shown to campers on order detail page
    private String vehicleType; // e.g. "VAN", "TRUCK", "MOTO"

    /** Maximum payload capacity in kg for smart assignment scoring. */
    private double maxCapacityKg = 100.0;

    /** Geographic zone labels this vehicle can serve (e.g. ["NORTH", "CENTRE"]). */
    private List<String> coverageZones = new ArrayList<>();

    // Current location for proximity-based assignment
    private Double latitude;
    private Double longitude;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @CreatedBy
    private String createdBy;

    private boolean deleted = false;
}
