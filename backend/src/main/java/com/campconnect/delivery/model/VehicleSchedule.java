package com.campconnect.delivery.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "vehicle_schedules")
@Data
@NoArgsConstructor
@CompoundIndex(name = "idx_vehicle_date_unique", def = "{'vehicleId': 1, 'date': 1}", unique = true)
public class VehicleSchedule {

    @Id
    private String id;

    @Indexed
    private String vehicleId;

    @Indexed
    private String providerId;

    @Indexed
    private LocalDate date;

    /** Sum of gear weights (kg) assigned to this vehicle on this date. */
    private double usedCapacityKg = 0.0;

    /** Number of deliveries assigned to this vehicle on this date. */
    private int orderCount = 0;

    /** Delivery IDs assigned — denormalized for dashboard detail view. */
    private List<String> deliveryIds = new ArrayList<>();

    /** Geographic zones served on this date — used for scoring new assignments. */
    private List<String> zonesServed = new ArrayList<>();

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
