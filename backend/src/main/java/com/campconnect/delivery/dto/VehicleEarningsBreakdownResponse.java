package com.campconnect.delivery.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Earnings breakdown by vehicle for the driver")
public class VehicleEarningsBreakdownResponse {
    @Schema(description = "List of earnings per vehicle")
    private List<VehicleEarning> vehicleEarnings;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Earnings details for a specific vehicle")
    public static class VehicleEarning {
        @Schema(description = "Unique identifier of the vehicle", example = "veh-123")
        private String vehicleId;
        
        @Schema(description = "Display name of the vehicle", example = "Ford Transit Van")
        private String vehicleName;
        
        @Schema(description = "Number of deliveries made with this vehicle", example = "148")
        private Long deliveryCount;
        
        @Schema(description = "Total earnings from this vehicle", example = "4654.50")
        private BigDecimal earnings;
    }
}
