package com.campconnect.gear.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Schema(description = "Aggregated dashboard stats for equipment provider")
public class ProviderStatsResponse {
    private BigDecimal totalRevenue;
    private long activeRentals;
    private long pendingRequests;
    private long totalProducts;
    private double averageRating;
}
