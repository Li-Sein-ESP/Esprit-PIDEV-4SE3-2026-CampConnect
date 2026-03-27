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

    @Indexed
    private String driverId;
    private String driverName; // Denormalized

    private String pickupAddress;
    private String deliveryAddress;

    @Indexed
    private LocalDate scheduledDate;

    private LocalDateTime deliveredDate;

    @Indexed
    private DeliveryStatus status = DeliveryStatus.CREATED;

    @Indexed
    private DeliveryPriority priority = DeliveryPriority.NORMAL;

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
