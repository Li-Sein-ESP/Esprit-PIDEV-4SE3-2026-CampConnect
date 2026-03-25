package com.campconnect.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.campconnect.enums.PaymentStatus;
import com.campconnect.enums.PaymentMethod;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentDTO {
    private String id;
    private double amount;
    private PaymentStatus status;
    private PaymentMethod method;
    private LocalDateTime processedAt;
    private String reservationId;
}
