package com.campconnect.gear.dto;

import com.campconnect.gear.model.MaintenanceStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import lombok.Data;

import java.time.LocalDate;

@Data
@Schema(description = "Request body to create/update a maintenance record")
public class MaintenanceRequest {

    @NotBlank(message = "Gear ID is required")
    @Schema(example = "64abc12345def67890")
    private String gearId;

    @NotBlank(message = "Description is required")
    @Schema(example = "Inspect tent poles and replace damaged ones")
    private String description;

    @NotNull(message = "Maintenance date is required")
    @PastOrPresent(message = "Maintenance date must be today or in the past")
    @Schema(example = "2026-03-15")
    private LocalDate maintenanceDate;

    private MaintenanceStatus status = MaintenanceStatus.SCHEDULED;
}
