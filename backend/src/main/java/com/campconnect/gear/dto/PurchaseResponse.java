package com.campconnect.gear.dto;

import com.campconnect.gear.model.PurchaseStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Schema(description = "Purchase response")
public class PurchaseResponse {
    private String id;
    private String gearId;
    private String gearName;
    private String buyerId;
    private String buyerName;
    private int quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private PurchaseStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
