package com.campconnect.delivery.dto;

import com.campconnect.delivery.model.DeliveryPriority;
import com.campconnect.delivery.model.DeliveryMethod;
import com.campconnect.delivery.model.DeliveryType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
@Schema(description = "Request body for creating/updating a delivery")
public class DeliveryRequest {

    @Schema(example = "64abc12345def67890")
    private String rentalId;

    @Schema(example = "64abc12345def67891")
    private String purchaseId;

    @Schema(example = "64abc123456789abc")
    private String driverId;

    @Schema(example = "64abc123456789veh")
    private String vehicleId;

    @NotBlank(message = "Pickup address is required")
    @Schema(example = "123 Base Camp Road, Algiers")
    private String pickupAddress;

    @NotBlank(message = "Delivery address is required")
    @Schema(example = "45 Forest Trail, Tizi Ouzou")
    private String deliveryAddress;

    // Geographic tracking
    private Double customerLat;
    private Double customerLng;

    @NotNull(message = "Scheduled date is required")
    @FutureOrPresent(message = "Scheduled date must be today or in the future")
    @Schema(example = "2026-03-10")
    private LocalDate scheduledDate;

    @NotNull(message = "Priority is required")
    private DeliveryPriority priority = DeliveryPriority.NORMAL;

    private DeliveryType type;

    private DeliveryMethod method;

    private String warehouseId;

    // Optional route at creation time
    private RouteDto route;
}
