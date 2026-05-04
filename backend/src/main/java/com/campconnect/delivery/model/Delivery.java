package com.campconnect.delivery.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "deliveries")
@Data
@NoArgsConstructor
@CompoundIndexes({
        @CompoundIndex(name = "idx_delivery_driver_status", def = "{'driverId': 1, 'status': 1}"),
        @CompoundIndex(name = "idx_delivery_rental_status", def = "{'rentalId': 1, 'status': 1}")
})
public class Delivery {

    @Id
    private String id;

    // A delivery is linked to EITHER a rental OR a purchase
    @Indexed
    private String rentalId;

    @Indexed
    private String purchaseId;

    /** The camper who placed this order — populated at fulfillment time for camper-facing queries. */
    @Indexed
    private String camperUserId;

    /** Weight of the gear in kg — used for vehicle capacity scoring. */
    private double gearWeightKg = 0.0;

    @Indexed
    private String driverId;
    private String driverName; // Denormalized

    @Indexed
    private String vehicleId;

    private String pickupAddress;
    private String deliveryAddress;

    // Actual coordinates matching mapping destinations
    private Double customerLat;
    private Double customerLng;

    @Indexed
    private LocalDate scheduledDate;

    private LocalDateTime deliveredDate;

    @Indexed
    private DeliveryStatus status = DeliveryStatus.CREATED;

    @Indexed
    private DeliveryPriority priority = DeliveryPriority.NORMAL;

    // --- Multi-Warehouse & Smart Delivery fields ---
    @Indexed
    private DeliveryType type = DeliveryType.EXPRESS;

    @Indexed
    private DeliveryMethod method = DeliveryMethod.DELIVERY;

    private String warehouseId;

    private String batchId; // nullable — only for NORMAL batched deliveries

    /** Estimated duration in minutes (from RouteService) */
    private Double estimatedDuration;

    /** Actual duration in minutes (calculated on DELIVERED) */
    private Double actualDuration;

    // Embedded route — tightly coupled to delivery lifecycle
    private Route route;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @CreatedBy
    private String createdBy;

    private boolean deleted = false;
}
