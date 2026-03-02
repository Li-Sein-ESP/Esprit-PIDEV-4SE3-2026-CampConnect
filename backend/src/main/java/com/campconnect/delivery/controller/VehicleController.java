package com.campconnect.delivery.controller;

import com.campconnect.common.PagedResponse;
import com.campconnect.delivery.dto.VehicleRequest;
import com.campconnect.delivery.dto.VehicleResponse;
import com.campconnect.delivery.model.VehicleStatus;
import com.campconnect.delivery.service.VehicleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
@Tag(name = "Vehicles", description = "Delivery vehicle fleet management")
@PreAuthorize("hasRole('ADMIN') or hasRole('DELIVERY_PROVIDER')")
public class VehicleController {

    private final VehicleService vehicleService;

    @GetMapping
    @Operation(summary = "List all vehicles (filterable by status)")
    public ResponseEntity<PagedResponse<VehicleResponse>> getAll(
            @RequestParam(required = false) VehicleStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "plateNumber,asc") String sort) {

        String[] parts = sort.split(",");
        Sort.Direction dir = parts.length > 1 && parts[1].equalsIgnoreCase("desc")
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;
        return ResponseEntity.ok(vehicleService.findAll(
                status, PageRequest.of(page, size, Sort.by(dir, parts[0]))));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get vehicle by ID")
    public ResponseEntity<VehicleResponse> getById(@PathVariable String id) {
        return ResponseEntity.ok(vehicleService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Register a new vehicle (Admin only)")
    public ResponseEntity<VehicleResponse> create(@Valid @RequestBody VehicleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(vehicleService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update vehicle details (Admin only)")
    public ResponseEntity<VehicleResponse> update(
            @PathVariable String id,
            @Valid @RequestBody VehicleRequest request) {
        return ResponseEntity.ok(vehicleService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Soft-delete a vehicle (Admin only)")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        vehicleService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
