package com.campconnect.delivery.dto;

import com.campconnect.delivery.model.DeliveryPriority;
import com.campconnect.delivery.model.DeliveryMethod;
import com.campconnect.delivery.model.DeliveryStatus;
import com.campconnect.delivery.model.DeliveryType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Schema(description = "Delivery response")
public class DeliveryResponse {
    private String id;
    private String rentalId;
    private String purchaseId;
    private String driverId;
    private String driverName;
    private String vehicleId;
    private String pickupAddress;
    private String deliveryAddress;
    private Double customerLat;
    private Double customerLng;
    private LocalDate scheduledDate;
    private LocalDateTime deliveredDate;
    private DeliveryStatus status;
    private DeliveryPriority priority;
    private DeliveryType type;
    private DeliveryMethod method;
    private String warehouseId;
    private String batchId;
    private Double estimatedDuration;
    private Double actualDuration;
    private RouteDto route;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
