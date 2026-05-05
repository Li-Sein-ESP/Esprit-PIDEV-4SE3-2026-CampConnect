package com.campconnect.gear.dto;

import com.campconnect.gear.model.MaintenanceStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Schema(description = "Maintenance record response")
public class MaintenanceResponse {
    private String id;
    private String gearId;
    private String description;
    private LocalDate maintenanceDate;
    private MaintenanceStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
