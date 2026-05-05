package com.campconnect.delivery.dto;

import com.campconnect.delivery.model.VehicleStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Schema(description = "Vehicle response")
public class VehicleResponse {
    private String id;
    private String plateNumber;
    private double capacity;
    private VehicleStatus status;
    private String driverId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
