package com.campconnect.gear.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Unified view of a single order (rental or purchase) for the camper's order list.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CamperOrderSummaryDto {

    private String orderId;

    /** "RENTAL" or "PURCHASE" */
    private String orderType;

    private String gearId;
    private String gearName;
    private String gearImageUrl;

    // --- Rental fields (null for purchases) ---
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer rentalDays;

    // --- Pricing ---
    private BigDecimal totalPrice;
    private BigDecimal discountApplied;

    // --- Delivery info ---
    /** Camper-friendly 5-step label or null if no delivery created yet. */
    private String deliveryStatus;

    /** Raw backend DeliveryStatus enum value, for badge colouring. */
    private String rawDeliveryStatus;

    private LocalDateTime createdAt;
}
