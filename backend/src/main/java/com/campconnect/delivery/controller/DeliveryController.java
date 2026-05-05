package com.campconnect.delivery.controller;

import com.campconnect.common.PagedResponse;
import com.campconnect.delivery.dto.DeliveryRequest;
import com.campconnect.delivery.dto.DeliveryResponse;
import com.campconnect.delivery.dto.DriverProfileStatsResponse;
import com.campconnect.delivery.dto.EarningsResponse;
import com.campconnect.delivery.dto.RecentPaymentsResponse;
import com.campconnect.delivery.dto.RouteDto;
import com.campconnect.delivery.dto.VehicleEarningsBreakdownResponse;
import com.campconnect.delivery.model.DeliveryPriority;
import com.campconnect.delivery.model.DeliveryStatus;
import com.campconnect.delivery.service.DeliveryService;
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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/deliveries")
@RequiredArgsConstructor
@Tag(name = "Deliveries", description = "Delivery & Logistics management")
public class DeliveryController {

    private final DeliveryService deliveryService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('DELIVERY_PROVIDER')")
    @Operation(summary = "List all deliveries (filterable by status and priority)")
    public ResponseEntity<PagedResponse<DeliveryResponse>> getAll(
            @RequestParam(required = false) DeliveryStatus status,
            @RequestParam(required = false) DeliveryPriority priority,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "scheduledDate,desc") String sort) {

        String[] parts = sort.split(",");
        Sort.Direction dir = parts.length > 1 && parts[1].equalsIgnoreCase("asc")
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        return ResponseEntity.ok(deliveryService.findAll(
                status, priority, PageRequest.of(page, size, Sort.by(dir, parts[0]))));
    }

    @GetMapping("/my-deliveries")
    @PreAuthorize("hasRole('DELIVERY_PROVIDER')")
    @Operation(summary = "Get deliveries assigned to the current driver")
    public ResponseEntity<PagedResponse<DeliveryResponse>> getMyDeliveries(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(deliveryService.findByDriver(
                resolveUserId(userDetails), PageRequest.of(page, size,
                        Sort.by(Sort.Direction.DESC, "scheduledDate"))));
    }

    @GetMapping("/date-range")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DELIVERY_PROVIDER')")
    @Operation(summary = "Get deliveries scheduled in a date range")
    public ResponseEntity<PagedResponse<DeliveryResponse>> getByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(deliveryService.findByDateRange(
                from, to, PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "scheduledDate"))));
    }

    @GetMapping("/earnings")
    @PreAuthorize("hasRole('DELIVERY_PROVIDER') or hasRole('ADMIN')")
    @Operation(summary = "Get earnings summary for current driver")
    public ResponseEntity<EarningsResponse> getEarnings(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(deliveryService.calculateEarnings(resolveUserId(userDetails)));
    }

    @GetMapping("/profile-stats")
    @PreAuthorize("hasRole('DELIVERY_PROVIDER')")
    @Operation(summary = "Get driver profile statistics")
    public ResponseEntity<DriverProfileStatsResponse> getProfileStats(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(deliveryService.getDriverProfileStats(resolveUserId(userDetails)));
    }

    @GetMapping("/earnings/breakdown")
    @PreAuthorize("hasRole('DELIVERY_PROVIDER') or hasRole('ADMIN')")
    @Operation(summary = "Get vehicle earnings breakdown")
    public ResponseEntity<VehicleEarningsBreakdownResponse> getEarningsBreakdown(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(deliveryService.getVehicleEarningsBreakdown(resolveUserId(userDetails)));
    }

    @GetMapping("/earnings/payments")
    @PreAuthorize("hasRole('DELIVERY_PROVIDER') or hasRole('ADMIN')")
    @Operation(summary = "Get recent payment history")
    public ResponseEntity<RecentPaymentsResponse> getRecentPayments(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(deliveryService.getRecentPayments(resolveUserId(userDetails)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DELIVERY_PROVIDER')")
    @Operation(summary = "Get delivery by ID")
    public ResponseEntity<DeliveryResponse> getById(@PathVariable String id) {
        return ResponseEntity.ok(deliveryService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('DELIVERY_PROVIDER')")
    @Operation(summary = "Create a delivery (rental must be APPROVED; driver must have DELIVERY_PROVIDER role)")
    public ResponseEntity<DeliveryResponse> create(@Valid @RequestBody DeliveryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(deliveryService.create(request));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DELIVERY_PROVIDER')")
    @Operation(summary = "Update delivery status (state-transition validated; DELIVERED → rental auto-completed)")
    public ResponseEntity<DeliveryResponse> updateStatus(
            @PathVariable String id,
            @RequestParam DeliveryStatus status) {
        return ResponseEntity.ok(deliveryService.updateStatus(id, status));
    }

    @PutMapping("/{id}/route")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DELIVERY_PROVIDER')")
    @Operation(summary = "Update route for a delivery")
    public ResponseEntity<DeliveryResponse> updateRoute(
            @PathVariable String id,
            @Valid @RequestBody RouteDto routeDto) {
        return ResponseEntity.ok(deliveryService.updateRoute(id, routeDto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Soft-delete a delivery (Admin only; cannot delete in-transit deliveries)")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        deliveryService.softDelete(id);
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
