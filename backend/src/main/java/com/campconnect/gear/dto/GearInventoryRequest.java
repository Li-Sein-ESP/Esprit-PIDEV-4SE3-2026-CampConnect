package com.campconnect.gear.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GearInventoryRequest {
    @NotBlank(message = "Gear ID is required")
    private String gearId;

    @NotBlank(message = "Warehouse ID is required")
    private String warehouseId;

    @Min(value = 0, message = "Quantity must be >= 0")
    private int quantity;
}
