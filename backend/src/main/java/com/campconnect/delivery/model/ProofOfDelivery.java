package com.campconnect.delivery.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "proof_of_delivery")
@Data
@NoArgsConstructor
public class ProofOfDelivery {

    @Id
    private String id;

    @Indexed(unique = true)
    private String deliveryId;

    private String recipientName;
    private String signatureDataUrl; // base64 data-URL of the signature image
    private String photoUrl;         // URL to an uploaded photo
    private String notes;

    @CreatedDate
    private LocalDateTime createdAt;
}
