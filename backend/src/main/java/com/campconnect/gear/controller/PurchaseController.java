package com.campconnect.gear.controller;

import com.campconnect.common.PagedResponse;
import com.campconnect.gear.dto.PurchaseRequest;
import com.campconnect.gear.dto.PurchaseResponse;
import com.campconnect.gear.service.PurchaseService;
import com.campconnect.service.UserDetailsImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/purchases")
@RequiredArgsConstructor
@Tag(name = "Purchases", description = "Gear purchase operations")
public class PurchaseController {

    private final PurchaseService purchaseService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Purchase a gear item")
    public ResponseEntity<PurchaseResponse> create(
            @Valid @RequestBody PurchaseRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(purchaseService.create(request, userDetails.getId()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get a single purchase by ID (authenticated user, owner-checked in service)")
    public ResponseEntity<PurchaseResponse> getById(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(purchaseService.findById(id));
    }

    @GetMapping("/my-purchases")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get all purchases made by the authenticated user")
    public ResponseEntity<PagedResponse<PurchaseResponse>> getMyPurchases(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(purchaseService.findByBuyer(userDetails.getId(), pageable));
    }

    @GetMapping("/gear/{gearId}")
    @PreAuthorize("hasRole('EQUIPMENT_PROVIDER') or hasRole('ADMIN')")
    @Operation(summary = "Get all purchases for a specific gear item (provider/admin only)")
    public ResponseEntity<PagedResponse<PurchaseResponse>> getByGear(
            @PathVariable String gearId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(purchaseService.findByGear(gearId, pageable));
    }
}
