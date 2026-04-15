package com.campconnect.delivery.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Recent payment history for the driver")
public class RecentPaymentsResponse {
    @Schema(description = "List of recent payments received")
    private List<Payment> payments;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Individual payment details")
    public static class Payment {
        @Schema(description = "Unique payment identifier", example = "pay-456")
        private String id;
        
        @Schema(description = "Associated delivery identifier", example = "del-123")
        private String deliveryId;
        
        @Schema(description = "Name of the customer who made the payment", example = "John Doe")
        private String customerName;
        
        @Schema(description = "Payment amount", example = "45.50")
        private BigDecimal amount;
        
        @Schema(description = "Date and time when payment was made")
        private LocalDateTime paymentDate;
        
        @Schema(description = "Payment status", example = "COMPLETED")
        private String status;
    }
}
