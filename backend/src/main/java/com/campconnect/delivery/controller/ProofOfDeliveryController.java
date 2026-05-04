package com.campconnect.delivery.controller;

import com.campconnect.delivery.dto.ProofOfDeliveryRequest;
import com.campconnect.delivery.dto.ProofOfDeliveryResponse;
import com.campconnect.delivery.service.ProofOfDeliveryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/deliveries")
@RequiredArgsConstructor
@Tag(name = "Proof of Delivery", description = "Proof of delivery submission and retrieval")
public class ProofOfDeliveryController {

    private final ProofOfDeliveryService proofService;

    /**
     * POST /api/deliveries/{id}/proof
     * Driver submits signature + photo after marking delivery as DELIVERED.
     */
    @PostMapping("/{id}/proof")
    @PreAuthorize("hasRole('DELIVERY_PROVIDER') or hasRole('ADMIN')")
    @Operation(summary = "Submit proof of delivery (signature/photo/notes)")
    public ResponseEntity<ProofOfDeliveryResponse> submitProof(
            @PathVariable String id,
            @Valid @RequestBody ProofOfDeliveryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(proofService.submit(id, request));
    }

    /**
     * GET /api/deliveries/{id}/proof
     * Retrieve the proof record for a given delivery.
     */
    @GetMapping("/{id}/proof")
    @PreAuthorize("hasRole('DELIVERY_PROVIDER') or hasRole('ADMIN')")
    @Operation(summary = "Get proof of delivery for a delivery")
    public ResponseEntity<ProofOfDeliveryResponse> getProof(@PathVariable String id) {
        return ResponseEntity.ok(proofService.getByDeliveryId(id));
    }
}
