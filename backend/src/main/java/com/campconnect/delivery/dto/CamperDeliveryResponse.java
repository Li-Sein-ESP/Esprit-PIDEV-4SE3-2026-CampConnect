package com.campconnect.delivery.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Lightweight delivery response exposed to campers.
 * Does NOT expose internal statuses like DISPATCHED.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CamperDeliveryResponse {

    private String id;
    private String rentalId;
    private String purchaseId;

    /** Raw backend status (for frontend badge colouring). */
    private String status;

    /** Simplified 5-step label shown to the camper. */
    private String camperStatus;

    private String driverName;
    private String vehicleType;
    private String deliveryAddress;

    private LocalDate scheduledDate;
    private LocalDateTime deliveredDate;

    private Double customerLat;
    private Double customerLng;
}
