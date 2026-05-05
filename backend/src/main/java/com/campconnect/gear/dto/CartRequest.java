package com.campconnect.gear.dto;

import com.campconnect.gear.model.CartItemType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartRequest {
    @NotBlank(message = "Gear ID is required")
    private String gearId;

    @NotNull(message = "Item type (RENT or BUY) is required")
    private CartItemType itemType;

    @Min(value = 1, message = "Quantity must be at least 1")
    private int quantity = 1;

    // For Rentals
    private LocalDate startDate;
    private LocalDate endDate;

    // Delivery Options (passed directly from FrontEnd UI)
    private boolean requiresDelivery;
    private String deliveryAddress;
}
