package com.campconnect.gear.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Schema(description = "Request body to purchase a gear item")
public class PurchaseRequest {

    @NotBlank(message = "Gear ID is required")
    @Schema(example = "64abc12345def67890")
    private String gearId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    @Schema(example = "1")
    private Integer quantity;
}
