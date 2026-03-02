package com.campconnect.gear.dto;

import com.campconnect.gear.model.RentalStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Schema(description = "Rental response")
public class RentalResponse {
    private String id;
    private String gearId;
    private String gearName;
    private String renterId;
    private String renterName;
    private LocalDate startDate;
    private LocalDate endDate;
    private RentalStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
