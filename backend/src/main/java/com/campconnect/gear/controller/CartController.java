package com.campconnect.gear.controller;

import com.campconnect.gear.dto.CartRequest;
import com.campconnect.gear.dto.CartResponse;
import com.campconnect.gear.service.CartService;
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

    @PostMapping("/checkout")
    @Operation(summary = "Checkout all items in the cart")
    public ResponseEntity<Void> checkoutCart(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        cartService.checkoutCart(userDetails.getId());
        return ResponseEntity.ok().build();
    }
}
