package com.campconnect.delivery.dto;

import com.campconnect.delivery.model.DeliveryPriority;
import com.campconnect.delivery.model.DeliveryStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Schema(description = "Delivery response")
public class DeliveryResponse {
    private String id;
    private String rentalId;
    private String driverId;
    private String driverName;
    private String pickupAddress;
    private String deliveryAddress;
    private LocalDate scheduledDate;
    private LocalDateTime deliveredDate;
    private DeliveryStatus status;
    private DeliveryPriority priority;
    private RouteDto route;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
