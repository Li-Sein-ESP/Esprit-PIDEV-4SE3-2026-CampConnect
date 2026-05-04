package com.campconnect.delivery.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Driver profile statistics for the delivery dashboard")
public class DriverProfileStatsResponse {
    @Schema(description = "Total number of deliveries completed by the driver", example = "452")
    private Long totalDeliveries;
    
    @Schema(description = "Number of currently active delivery jobs", example = "2")
    private Long activeJobs;
    
    @Schema(description = "Total earnings accumulated by the driver", example = "12450.00")
    private BigDecimal totalEarnings;
    
    @Schema(description = "Average customer rating (1-5 scale)", example = "4.8")
    private Double rating;
    
    @Schema(description = "Percentage of deliveries completed successfully", example = "98.5")
    private Double completionRate;
    
    @Schema(description = "Percentage of deliveries completed on time", example = "96.2")
    private Double onTimeRate;
    
    @Schema(description = "Count of deliveries with DELIVERED status", example = "445")
    private Long deliveredCount;
    
    @Schema(description = "Count of deliveries with CANCELLED status", example = "5")
    private Long cancelledCount;
    
    @Schema(description = "Count of deliveries with FAILED status", example = "2")
    private Long failedCount;
}
