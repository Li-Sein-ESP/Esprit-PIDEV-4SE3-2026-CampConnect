package com.campconnect.gear.dto;

import com.campconnect.gear.model.GearStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Schema(description = "Request body to create/update a gear item")
public class GearRequest {

    @NotBlank(message = "Gear name is required")
    @Size(min = 3, max = 100, message = "Name must be between 3 and 100 characters")
    @Schema(example = "4-Person Dome Tent")
    private String name;

    @NotBlank(message = "Description is required")
    @Size(max = 500, message = "Description must not exceed 500 characters")
    @Schema(example = "Waterproof dome tent suitable for 4 people")
    private String description;

    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    @Schema(example = "25.00")
    private BigDecimal price;

    @Min(value = 0, message = "Quantity cannot be negative")
    @Schema(example = "5")
    private int quantity;

    @NotBlank(message = "Condition is required")
    @Schema(example = "Good - slight wear marks")
    private String condition;

    @NotBlank(message = "Category is required")
    @Schema(example = "Tents & Shelters")
    private String category;

    // Status is set to AVAILABLE by default; provider can override only on update
    private GearStatus status;

    @NotEmpty(message = "At least one initial image URL is required")
    @Schema(example = "[\"https://images.unsplash.com/photo-1525811902-f2342640856e\"]")
    private List<String> imageUrls;
}
