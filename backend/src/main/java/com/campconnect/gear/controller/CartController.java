package com.campconnect.gear.controller;

import com.campconnect.gear.dto.CartRequest;
import com.campconnect.gear.dto.CartResponse;
import com.campconnect.gear.dto.CheckoutRequest;
import com.campconnect.gear.service.CartService;
import com.campconnect.payment.service.PaymentService;
import com.campconnect.service.UserDetailsImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@Tag(name = "Shopping Cart", description = "Cart management")
@PreAuthorize("isAuthenticated()")
public class CartController {

    private final CartService cartService;
    private final PaymentService paymentService;

    @GetMapping
    @Operation(summary = "Get current user's cart")
    public ResponseEntity<CartResponse> getCart(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(cartService.getCart(userDetails.getId()));
    }

    @PostMapping("/items")
    @Operation(summary = "Add an item to the cart")
    public ResponseEntity<CartResponse> addToCart(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody CartRequest request) {
        return ResponseEntity.ok(cartService.addToCart(userDetails.getId(), request));
    }

    @DeleteMapping("/items/{itemId}")
    @Operation(summary = "Remove an item from the cart")
    public ResponseEntity<CartResponse> removeFromCart(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable String itemId) {
        return ResponseEntity.ok(cartService.removeFromCart(userDetails.getId(), itemId));
    }

    @PutMapping("/delivery-location")
    @Operation(summary = "Update delivery preference and location for all items in cart")
    public ResponseEntity<CartResponse> updateDeliveryLocation(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody CartRequest request) { // Reusing CartRequest partially for simplicity
        return ResponseEntity.ok(cartService.updateDeliveryLocation(userDetails.getId(), request));
    }

    @PostMapping("/checkout")
    @Operation(summary = "Checkout all items in the cart via Stripe")
    public ResponseEntity<java.util.Map<String, String>> checkoutCart(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody CheckoutRequest checkoutRequest,
            @RequestParam String successUrl,
            @RequestParam String cancelUrl) {
        
        try {
            // First we need the cart ID
            com.campconnect.gear.model.Cart cart = cartService.getCart(userDetails.getId()) != null 
                    ? cartService.getCartEntity(userDetails.getId()) 
                    : null;
            
            if (cart == null || cart.getItems().isEmpty()) {
                return ResponseEntity.badRequest().body(java.util.Map.of("error", "Cart is empty"));
            }

            java.util.Map<String, String> response = paymentService.createCheckoutSessionForCart(
                    cart.getId(), checkoutRequest, successUrl, cancelUrl);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(java.util.Map.of("error", e.getMessage()));
        }
    }
}
