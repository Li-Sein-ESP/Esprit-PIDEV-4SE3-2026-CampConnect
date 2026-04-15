package com.campconnect.gear.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Schema(description = "Analytics data for a gear item")
public class GearAnalyticsResponse {
    private String gearId;
    private String gearName;
    private long totalRentals;
    private long totalPurchases;
    private BigDecimal totalRevenue;
    private double averageRating;
    private int activeRentals;
    private int availableStock;
}
