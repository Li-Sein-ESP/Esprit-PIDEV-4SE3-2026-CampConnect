package com.campconnect.gear.service;

import com.campconnect.delivery.model.DeliveryMethod;
import com.campconnect.delivery.model.DeliveryType;
import com.campconnect.delivery.model.Warehouse;
import com.campconnect.delivery.repository.DeliveryRepository;
import com.campconnect.delivery.service.BatchService;
import com.campconnect.delivery.service.DeliveryService;
import com.campconnect.delivery.service.SmartVehicleAssignmentService;
import com.campconnect.exception.BadRequestException;
import com.campconnect.service.LoyaltyService;
import com.campconnect.gear.dto.CheckoutRequest;
import com.campconnect.gear.dto.PurchaseRequest;
import com.campconnect.gear.dto.RentalRequest;
import com.campconnect.gear.model.Cart;
import com.campconnect.gear.model.CartItem;
import com.campconnect.gear.model.CartItemType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class FulfillmentService {

    private final GearInventoryService gearInventoryService;
    private final RentalService rentalService;
    private final PurchaseService purchaseService;
    private final DeliveryService deliveryService;
    private final SmartVehicleAssignmentService smartVehicleAssignmentService;
    private final BatchService batchService;
    private final DeliveryRepository deliveryRepository;
    private final com.campconnect.delivery.repository.WarehouseRepository warehouseRepository;
    private final LoyaltyService loyaltyService;
    private final com.campconnect.gear.repository.GearRepository gearRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public void fulfillPaidCart(Cart cart, CheckoutRequest checkoutRequest) {
        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        DeliveryMethod method = checkoutRequest.getDeliveryMethod() != null
                ? checkoutRequest.getDeliveryMethod()
                : DeliveryMethod.DELIVERY;
        DeliveryType type = checkoutRequest.getDeliveryType() != null
                ? checkoutRequest.getDeliveryType()
                : DeliveryType.EXPRESS;

        for (CartItem item : cart.getItems()) {
            String warehouseId = resolveWarehouse(item, checkoutRequest, method);
            Warehouse warehouse = warehouseRepository.findById(warehouseId)
                    .filter(w -> !w.isDeleted())
                    .orElseThrow(() -> new BadRequestException("Selected warehouse not found"));

            gearInventoryService.reserveStock(item.getGearId(), warehouseId, item.getQuantity());

            // Resolve gear weight for capacity scoring
            double gearWeight = gearRepository.findById(item.getGearId())
                    .map(g -> g.getWeightKg() > 0 ? g.getWeightKg() : 0.0)
                    .orElse(0.0);

            // Calculate per-item discount share
            int itemCount = cart.getItems().size();
            java.math.BigDecimal discountShare = cart.getDiscountAmount() != null && itemCount > 0
                    ? cart.getDiscountAmount().divide(java.math.BigDecimal.valueOf(itemCount), 2, java.math.RoundingMode.HALF_UP)
                    : java.math.BigDecimal.ZERO;

            String rentalId = null;
            String purchaseId = null;

            if (item.getItemType() == CartItemType.RENT) {
                RentalRequest req = new RentalRequest();
                req.setGearId(item.getGearId());
                req.setStartDate(item.getStartDate());
                req.setEndDate(item.getEndDate());
                LocalDate rentalStart = item.getStartDate() != null ? item.getStartDate() : LocalDate.now();
                for (int i = 0; i < item.getQuantity(); i++) {
                    com.campconnect.gear.model.Rental createdRental = rentalService.createEntity(req, cart.getUserId());
                    createdRental.setDiscountApplied(discountShare);
                    rentalId = createdRental.getId();
                    createDeliveryIfNeeded(method, type, warehouse, checkoutRequest, item, rentalId, null, rentalStart, cart.getUserId(), gearWeight);
                }
            } else {
                PurchaseRequest req = new PurchaseRequest();
                req.setGearId(item.getGearId());
                req.setQuantity(item.getQuantity());
                com.campconnect.gear.model.Purchase createdPurchase = purchaseService.createEntity(req, cart.getUserId());
                createdPurchase.setDiscountApplied(discountShare);
                purchaseId = createdPurchase.getId();
                createDeliveryIfNeeded(method, type, warehouse, checkoutRequest, item, null, purchaseId, LocalDate.now().plusDays(2), cart.getUserId(), gearWeight);
            }
        }

        try {
            loyaltyService.updateTier(cart.getUserId());
        } catch (Exception e) {
            System.err.println("Failed to update fidelity tier for user " + cart.getUserId() + ": " + e.getMessage());
        }
    }

    private String resolveWarehouse(CartItem item, CheckoutRequest checkoutRequest, DeliveryMethod method) {
        if (method == DeliveryMethod.PICKUP) {
            if (checkoutRequest.getPickupWarehouseId() == null || checkoutRequest.getPickupWarehouseId().isBlank()) {
                throw new BadRequestException("Pickup warehouse is required for PICKUP method");
            }
            return checkoutRequest.getPickupWarehouseId();
        }

        Double lat = checkoutRequest.getCustomerLat() != null ? checkoutRequest.getCustomerLat() : item.getCustomerLat();
        Double lng = checkoutRequest.getCustomerLng() != null ? checkoutRequest.getCustomerLng() : item.getCustomerLng();
        if (lat == null || lng == null) {
            throw new BadRequestException("Customer coordinates are required for DELIVERY method");
        }
        Warehouse nearest = gearInventoryService.findNearestWarehouseWithStock(item.getGearId(), item.getQuantity(), lat, lng);
        return nearest.getId();
    }

    private void createDeliveryIfNeeded(
            DeliveryMethod method,
            DeliveryType type,
            Warehouse warehouse,
            CheckoutRequest checkoutRequest,
            CartItem item,
            String rentalId,
            String purchaseId,
            LocalDate scheduledDate,
            String camperUserId,
            double gearWeightKg) {

        com.campconnect.delivery.dto.DeliveryRequest deliveryReq = new com.campconnect.delivery.dto.DeliveryRequest();
        deliveryReq.setRentalId(rentalId);
        deliveryReq.setPurchaseId(purchaseId);
        deliveryReq.setPickupAddress(warehouse.getAddress());
        deliveryReq.setWarehouseId(warehouse.getId());
        deliveryReq.setMethod(method);
        deliveryReq.setType(type);
        deliveryReq.setPriority(com.campconnect.delivery.model.DeliveryPriority.NORMAL);
        deliveryReq.setScheduledDate(scheduledDate);

        if (method == DeliveryMethod.DELIVERY) {
            deliveryReq.setDeliveryAddress(checkoutRequest.getDeliveryAddress());
            deliveryReq.setCustomerLat(checkoutRequest.getCustomerLat() != null ? checkoutRequest.getCustomerLat() : item.getCustomerLat());
            deliveryReq.setCustomerLng(checkoutRequest.getCustomerLng() != null ? checkoutRequest.getCustomerLng() : item.getCustomerLng());

            try {
                com.campconnect.delivery.model.Delivery delivery = deliveryRepository
                        .findById(deliveryService.create(deliveryReq).getId())
                        .orElseThrow(() -> new RuntimeException("Created delivery not found"));

                // Populate fields BEFORE assignment so the assignment service has correct weight
                delivery.setCamperUserId(camperUserId);
                delivery.setGearWeightKg(gearWeightKg);
                delivery = deliveryRepository.save(delivery);  // flush weight to DB first

                log.info("[Fulfillment] Created delivery {} for {} — weight={}kg warehouseId={} type={}",
                        delivery.getId(), camperUserId, gearWeightKg, delivery.getWarehouseId(), delivery.getType());

                try {
                    if (type == DeliveryType.EXPRESS) {
                        smartVehicleAssignmentService.assignVehicle(delivery);
                    } else {
                        batchService.addToBatch(delivery);
                    }
                } catch (Exception e) {
                    log.warn("Delivery assignment failed for {} — will be retried: {}", delivery.getId(), e.getMessage());
                    Map<String, Object> alert = new HashMap<>();
                    alert.put("type", "ASSIGNMENT_FAILED");
                    alert.put("deliveryId", delivery.getId());
                    alert.put("reason", e.getMessage());
                    alert.put("deliveryAddress", delivery.getDeliveryAddress());
                    messagingTemplate.convertAndSend("/topic/delivery-notifications", alert);
                }
            } catch (Exception ex) {
                log.error("CRITICAL: Delivery creation failed for rental={} purchase={}: {}", rentalId, purchaseId, ex.getMessage());
                throw ex;
            }
            return;
        }

        // PICKUP: mark delivery as assigned immediately
        deliveryReq.setDeliveryAddress(warehouse.getAddress());
        String deliveryId = deliveryService.create(deliveryReq).getId();
        deliveryRepository.findById(deliveryId).ifPresent(delivery -> {
            delivery.setCamperUserId(camperUserId);
            delivery.setGearWeightKg(gearWeightKg);
            deliveryRepository.save(delivery);
        });
        deliveryService.updateStatus(deliveryId, com.campconnect.delivery.model.DeliveryStatus.ASSIGNED, null);
    }
}
