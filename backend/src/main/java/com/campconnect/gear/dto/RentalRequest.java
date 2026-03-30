package com.campconnect.gear.dto;

import com.campconnect.gear.model.RentalStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
@Schema(description = "Request body to create a rental")
public class RentalRequest {

    @NotBlank(message = "Gear ID is required")
    @Schema(example = "64abc12345def67890")
    private String gearId;

    @NotNull(message = "Start date is required")
    @FutureOrPresent(message = "Start date must be today or in the future")
    @Schema(example = "2026-03-01")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    @Future(message = "End date must be in the future")
    @Schema(example = "2026-03-07")
    private LocalDate endDate;
}
