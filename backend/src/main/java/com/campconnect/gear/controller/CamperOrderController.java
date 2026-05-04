package com.campconnect.gear.controller;

import com.campconnect.common.PagedResponse;
import com.campconnect.delivery.dto.CamperDeliveryResponse;
import com.campconnect.delivery.repository.DeliveryRepository;
import com.campconnect.delivery.repository.VehicleRepository;
import com.campconnect.exception.BadRequestException;
import com.campconnect.exception.ResourceNotFoundException;
import com.campconnect.gear.dto.CamperOrderSummaryDto;
import com.campconnect.gear.service.CamperOrderService;
import com.campconnect.service.UserDetailsImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Camper Orders", description = "Unified camper order list (rentals + purchases)")
public class CamperOrderController {

    private final CamperOrderService camperOrderService;
    private final DeliveryRepository deliveryRepository;
    private final VehicleRepository vehicleRepository;

    /**
     * GET /api/orders/my-orders
     * Unified, date-sorted list of rentals and purchases for the authenticated camper.
     */
    @GetMapping("/my-orders")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get unified order list (rentals + purchases) for the authenticated camper")
    public ResponseEntity<PagedResponse<CamperOrderSummaryDto>> getMyOrders(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        PageRequest pageable = PageRequest.of(page, size,
                Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(camperOrderService.getMyOrders(userDetails.getId(), pageable));
    }

    /**
     * GET /api/orders/my-delivery?rentalId=...  OR  ?purchaseId=...
     * Camper-facing delivery status — hides internal statuses, returns 5-step label.
     */
    @GetMapping("/my-delivery")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get delivery details for a specific rental or purchase (camper-facing)")
    public ResponseEntity<CamperDeliveryResponse> getMyDelivery(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(required = false) String rentalId,
            @RequestParam(required = false) String purchaseId) {

        if (rentalId == null && purchaseId == null) {
            throw new BadRequestException("Either rentalId or purchaseId query param is required");
        }

        var deliveryOpt = rentalId != null
                ? deliveryRepository.findFirstByRentalIdAndDeletedFalse(rentalId)
                : deliveryRepository.findFirstByPurchaseIdAndDeletedFalse(purchaseId);

        var delivery = deliveryOpt.orElseThrow(() ->
                new ResourceNotFoundException("Delivery", "rentalId/purchaseId",
                        rentalId != null ? rentalId : purchaseId));

        // Ownership check — camper can only see their own delivery
        if (delivery.getCamperUserId() != null &&
                !delivery.getCamperUserId().equals(userDetails.getId())) {
            throw new AccessDeniedException("You do not have permission to view this delivery.");
        }

        // Resolve vehicle type label (e.g. "VAN") from vehicle entity
        String vehicleType = null;
        if (delivery.getVehicleId() != null) {
            vehicleType = vehicleRepository.findById(delivery.getVehicleId())
                    .map(v -> v.getVehicleType())
                    .orElse(null);
        }

        CamperDeliveryResponse response = CamperDeliveryResponse.builder()
                .id(delivery.getId())
                .rentalId(delivery.getRentalId())
                .purchaseId(delivery.getPurchaseId())
                .status(delivery.getStatus().name())
                .camperStatus(CamperOrderService.toCamperStatus(delivery.getStatus()))
                .driverName(delivery.getDriverName())
                .vehicleType(vehicleType)
                .deliveryAddress(delivery.getDeliveryAddress())
                .scheduledDate(delivery.getScheduledDate())
                .deliveredDate(delivery.getDeliveredDate())
                .customerLat(delivery.getCustomerLat())
                .customerLng(delivery.getCustomerLng())
                .build();

        return ResponseEntity.ok(response);
    }
}
