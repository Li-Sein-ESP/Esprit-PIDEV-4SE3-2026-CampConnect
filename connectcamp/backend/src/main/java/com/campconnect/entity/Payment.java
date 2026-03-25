package com.campconnect.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.campconnect.enums.PaymentStatus;
import com.campconnect.enums.PaymentMethod;
import java.time.LocalDateTime;

@Document(collection = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {
    @Id
    private String id;
    private double amount;
    private PaymentStatus status;
    private PaymentMethod method;
    private LocalDateTime processedAt;

    @DBRef
    private Reservation reservation;
}
