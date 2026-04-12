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

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @CreatedBy
    private String createdBy;

    private boolean deleted = false;
}
