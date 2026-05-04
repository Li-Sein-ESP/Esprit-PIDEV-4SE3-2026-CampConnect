package com.campconnect.delivery.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProofOfDeliveryRequest {

    @NotBlank(message = "Recipient name is required")
    private String recipientName;

    /** Base64 data-URL of the signature canvas (e.g. "data:image/png;base64,...") */
    private String signatureDataUrl;

    /** URL to an uploaded delivery photo */
    private String photoUrl;

    /** Optional driver notes */
    private String notes;
}
