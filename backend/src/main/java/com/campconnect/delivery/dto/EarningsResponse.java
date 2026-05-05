package com.campconnect.delivery.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
@Schema(description = "Delivery earnings summary for a driver")
public class EarningsResponse {
    private BigDecimal totalEarnings;
    private BigDecimal weeklyEarnings;
    private BigDecimal monthlyEarnings;
    private long deliveriesCompleted;
    private BigDecimal averagePerDelivery;
    private List<DailyEarning> dailyBreakdown;

    @Data
    public static class DailyEarning {
        private String date;
        private BigDecimal amount;
        private int count;

        public DailyEarning(String date, BigDecimal amount, int count) {
            this.date = date;
            this.amount = amount;
            this.count = count;
        }
    }
}
