package com.campconnect.delivery.controller;

import com.campconnect.delivery.dto.WarehouseRequest;
import com.campconnect.delivery.dto.WarehouseResponse;
import com.campconnect.delivery.service.WarehouseService;
import com.campconnect.service.UserDetailsImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/warehouses")
@RequiredArgsConstructor
@Tag(name = "Warehouses", description = "Warehouse management for providers")
public class WarehouseController {

    private final WarehouseService warehouseService;

    @PostMapping
    @PreAuthorize("hasRole('EQUIPMENT_PROVIDER') or hasRole('ADMIN')")
    @Operation(summary = "Create warehouse for authenticated provider")
    public ResponseEntity<WarehouseResponse> create(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody WarehouseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(warehouseService.create(request, resolveUserId(userDetails)));
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('EQUIPMENT_PROVIDER') or hasRole('ADMIN')")
    @Operation(summary = "Get warehouses for authenticated provider")
    public ResponseEntity<List<WarehouseResponse>> getMine(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(warehouseService.findByProvider(resolveUserId(userDetails)));
    }

    @GetMapping("/provider/{providerId}")
    @Operation(summary = "Get warehouses by provider ID")
    public ResponseEntity<List<WarehouseResponse>> getByProvider(@PathVariable String providerId) {
        return ResponseEntity.ok(warehouseService.findByProvider(providerId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get warehouse by ID")
    public ResponseEntity<WarehouseResponse> getById(@PathVariable String id) {
        return ResponseEntity.ok(warehouseService.findById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('EQUIPMENT_PROVIDER') or hasRole('ADMIN')")
    @Operation(summary = "Update warehouse")
    public ResponseEntity<WarehouseResponse> update(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody WarehouseRequest request) {
        return ResponseEntity.ok(warehouseService.update(id, request, resolveUserId(userDetails)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('EQUIPMENT_PROVIDER') or hasRole('ADMIN')")
    @Operation(summary = "Soft-delete warehouse")
    public ResponseEntity<Void> delete(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        warehouseService.delete(id, resolveUserId(userDetails));
        return ResponseEntity.noContent().build();
    }

    private String resolveUserId(UserDetailsImpl userDetails) {
        if (userDetails != null) {
            return userDetails.getId();
        }
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl principal) {
            return principal.getId();
        }
        throw new IllegalStateException("Authenticated user not found");
    }
}
