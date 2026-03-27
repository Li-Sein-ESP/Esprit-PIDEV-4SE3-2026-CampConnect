package com.campconnect.gear.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItem {
    private String id; // generated uniquely per item in cart
    private String gearId;
    private CartItemType itemType; // RENT or BUY

    // For both
    private int quantity;

    // For RENT only
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer rentalDays;

    // Pricing
    private BigDecimal unitPrice;
    private BigDecimal deposit;
    private BigDecimal lineTotal;

    // Delivery
    private boolean requiresDelivery;
    private String deliveryAddress;
}
