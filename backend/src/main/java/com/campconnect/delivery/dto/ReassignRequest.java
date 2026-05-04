package com.campconnect.delivery.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReassignRequest {
    @NotBlank(message = "Vehicle ID is required")
    private String vehicleId;
}
