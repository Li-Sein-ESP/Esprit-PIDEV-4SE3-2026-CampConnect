package com.campconnect.gear.dto;

import com.campconnect.gear.model.CartItemType;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponse {
    private String id; // The id of the cart item itself
    private String gearId;
    private CartItemType itemType;

    // Denormalized/Fetched from Gear for UI display
    private String gearName;
    private String gearImage;
    private String gearCondition;
    private String gearCategory;

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
}
