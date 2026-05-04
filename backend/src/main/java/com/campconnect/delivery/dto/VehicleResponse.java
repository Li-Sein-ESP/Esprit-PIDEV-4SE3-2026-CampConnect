package com.campconnect.delivery.dto;

import com.campconnect.delivery.model.VehicleStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Schema(description = "Vehicle response")
public class VehicleResponse {
    private String id;
    private String plateNumber;
    private double capacity;
    private VehicleStatus status;
    private String driverId;
    private String providerId;
    private String vehicleType;
    private double maxCapacityKg;
    private List<String> coverageZones;
    private Double latitude;
    private Double longitude;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
