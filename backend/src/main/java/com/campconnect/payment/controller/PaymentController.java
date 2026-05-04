package com.campconnect.payment.controller;

import com.campconnect.payment.service.PaymentService;
import com.stripe.exception.StripeException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Stripe Payment Integration")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/checkout/{purchaseId}")
    @Operation(summary = "Create a Stripe checkout session for a purchase")
    public ResponseEntity<Map<String, String>> createCheckoutSession(
            @PathVariable String purchaseId,
            @RequestParam String successUrl,
            @RequestParam String cancelUrl) {
        try {
            return ResponseEntity.ok(paymentService.createCheckoutSessionForPurchase(purchaseId, successUrl, cancelUrl));
        } catch (StripeException e) {
            return ResponseEntity.internalServerError().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/success")
    @Operation(summary = "Handle successful Stripe payment via session ID")
    public ResponseEntity<?> handlePaymentSuccess(@RequestParam String sessionId) {
        try {
            return ResponseEntity.ok(paymentService.handlePaymentSuccess(sessionId));
        } catch (StripeException e) {
            return ResponseEntity.internalServerError().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Unknown exception"));
        }
    }
}
