package com.campconnect.delivery.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ProofOfDeliveryResponse {
    private String id;
    private String deliveryId;
    private String recipientName;
    private String signatureDataUrl;
    private String photoUrl;
    private String notes;
    private LocalDateTime createdAt;
}
