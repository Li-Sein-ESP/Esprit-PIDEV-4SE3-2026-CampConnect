package com.campconnect.delivery.dto;

import com.campconnect.delivery.model.VehicleStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
@Schema(description = "Request to create/update a vehicle")
public class VehicleRequest {

    @NotBlank(message = "Plate number is required")
    @Size(min = 3, max = 20, message = "Plate number must be between 3 and 20 characters")
    @Schema(example = "16-DZA-001")
    private String plateNumber;

    @Positive(message = "Capacity must be a positive number")
    @Schema(example = "500.0")
    private double capacity;

    private VehicleStatus status;

    @Schema(example = "64abc12345def67890")
    private String driverId;

    @Schema(example = "64abc12345def67890")
    private String providerId;

    @Schema(example = "VAN", allowableValues = {"VAN", "TRUCK", "MOTO"})
    private String vehicleType;

    @Positive(message = "Max capacity must be positive")
    @Schema(example = "100.0")
    private double maxCapacityKg = 100.0;

    @Schema(example = "[\"NORTH\", \"CENTRE\"]")
    private List<String> coverageZones = new ArrayList<>();

    private Double latitude;
    private Double longitude;
}
