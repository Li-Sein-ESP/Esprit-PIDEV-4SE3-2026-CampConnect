package com.campconnect.delivery.controller;

import com.campconnect.common.PagedResponse;
import com.campconnect.delivery.dto.FleetScheduleResponse;
import com.campconnect.delivery.dto.ReassignRequest;
import com.campconnect.delivery.dto.VehicleRequest;
import com.campconnect.delivery.dto.VehicleResponse;
import com.campconnect.delivery.model.VehicleStatus;
import com.campconnect.delivery.service.SmartVehicleAssignmentService;
import com.campconnect.delivery.service.VehicleService;
import com.campconnect.service.UserDetailsImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
@Tag(name = "Vehicles", description = "Delivery vehicle fleet management")
@PreAuthorize("hasRole('ADMIN') or hasRole('DELIVERY_PROVIDER')")
public class VehicleController {

    private final VehicleService vehicleService;
    private final SmartVehicleAssignmentService smartVehicleAssignmentService;

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
    @PreAuthorize("hasRole('ADMIN') or hasRole('DELIVERY_PROVIDER')")
    @Operation(summary = "Register a new vehicle")
    public ResponseEntity<VehicleResponse> create(
            @Valid @RequestBody VehicleRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        // Auto-populate provider/driver from current user if not explicitly set
        if (request.getProviderId() == null || request.getProviderId().isBlank()) {
            request.setProviderId(userDetails.getId());
        }
        if (request.getDriverId() == null || request.getDriverId().isBlank()) {
            request.setDriverId(userDetails.getId());
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(vehicleService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DELIVERY_PROVIDER')")
    @Operation(summary = "Update vehicle details")
    public ResponseEntity<VehicleResponse> update(
            @PathVariable String id,
            @Valid @RequestBody VehicleRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        // Keep providerId stable for delivery providers
        if (request.getProviderId() == null || request.getProviderId().isBlank()) {
            request.setProviderId(userDetails.getId());
        }
        return ResponseEntity.ok(vehicleService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DELIVERY_PROVIDER')")
    @Operation(summary = "Soft-delete a vehicle (Admin only)")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        vehicleService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/fleet-schedule")
    @Operation(summary = "Get weekly fleet utilization schedule for provider's vehicles")
    public ResponseEntity<java.util.List<FleetScheduleResponse>> getFleetSchedule(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(vehicleService.getFleetSchedule(userDetails.getId(), from, to));
    }

    @PostMapping("/{id}/reassign")
    @Operation(summary = "Manually reassign a delivery to a specific vehicle")
    public ResponseEntity<com.campconnect.delivery.dto.DeliveryResponse> reassign(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable String id,
            @Valid @RequestBody ReassignRequest request) {
        return ResponseEntity.ok(
                smartVehicleAssignmentService.reassign(id, request.getVehicleId(), userDetails.getId()));
    }
}
