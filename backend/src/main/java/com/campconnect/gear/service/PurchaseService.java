package com.campconnect.gear.service;

import com.campconnect.common.PagedResponse;
import com.campconnect.delivery.dto.DeliveryRequest;
import com.campconnect.exception.BadRequestException;
import com.campconnect.exception.ResourceNotFoundException;
import com.campconnect.gear.dto.PurchaseRequest;
import com.campconnect.gear.dto.PurchaseResponse;
import com.campconnect.gear.model.*;
import com.campconnect.gear.repository.GearRepository;
import com.campconnect.gear.repository.PurchaseRepository;
import com.campconnect.model.User;
import com.campconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class PurchaseService {

    private final PurchaseRepository purchaseRepository;
    private final GearRepository gearRepository;
    private final UserRepository userRepository;
    private final MongoTemplate mongoTemplate;
    private final ModelMapper modelMapper;
    private final com.campconnect.delivery.service.DeliveryService deliveryService;

    // ---------- READ ----------

    public PagedResponse<PurchaseResponse> findByBuyer(String buyerId, Pageable pageable) {
        return PagedResponse.from(
                purchaseRepository.findByBuyerId(buyerId, pageable).map(this::toResponse));
    }

    public PagedResponse<PurchaseResponse> findByGear(String gearId, Pageable pageable) {
        return PagedResponse.from(
                purchaseRepository.findByGearId(gearId, pageable).map(this::toResponse));
    }

    // ---------- WRITE ----------

    /**
     * Atomically decrements gear stock and creates a purchase record.
     * Validates that the gear listing type allows purchase (FOR_SALE or BOTH).
     */
    @Transactional
    public PurchaseResponse create(PurchaseRequest request, String buyerId) {
        String gearId = request.getGearId();
        if (gearId == null) {
            throw new BadRequestException("Gear ID is required to make a purchase");
        }

        Gear gear = gearRepository.findById(gearId)
                .filter(g -> !g.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Gear", "id", gearId));

        // Validate listing type
        if (gear.getListingType() == ListingType.FOR_RENT) {
            throw new BadRequestException("This item is only available for rent, not for purchase.");
        }

        if (gear.getSalePrice() == null) {
            throw new BadRequestException("This item does not have a sale price set.");
        }

        int qty = request.getQuantity();

        // ATOMIC: decrement quantity
        Query atomicQuery = new Query(
                Criteria.where("_id").is(gearId)
                        .and("status").is(GearStatus.AVAILABLE)
                        .and("quantity").gte(qty)
                        .and("deleted").is(false));
        Update atomicUpdate = new Update().inc("quantity", -qty);
        Gear updatedGear = mongoTemplate.findAndModify(atomicQuery, atomicUpdate, Gear.class);

        if (updatedGear == null) {
            throw new BadRequestException(
                    "Gear is not available for purchase. It may be out of stock.");
        }

        // Set OUT_OF_STOCK if fully depleted
        if (updatedGear.getQuantity() - qty <= 0) {
            Query statusQuery = new Query(Criteria.where("_id").is(updatedGear.getId()));
            mongoTemplate.updateFirst(statusQuery,
                    new Update().set("status", GearStatus.OUT_OF_STOCK), Gear.class);
        }

        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", buyerId));

        BigDecimal unitPrice = gear.getSalePrice();
        BigDecimal totalPrice = unitPrice.multiply(BigDecimal.valueOf(qty));

        Purchase purchase = new Purchase();
        purchase.setGearId(updatedGear.getId());
        purchase.setGearName(updatedGear.getName());
        purchase.setBuyerId(buyerId);
        purchase.setBuyerName(buyer.getName());
        purchase.setQuantity(qty);
        purchase.setUnitPrice(unitPrice);
        purchase.setTotalPrice(totalPrice);
        purchase.setStatus(PurchaseStatus.CONFIRMED);

        Purchase savedPurchase = purchaseRepository.save(purchase);

        // Auto-create delivery for this purchase
        try {
            DeliveryRequest deliveryReq = new DeliveryRequest();
            deliveryReq.setPurchaseId(savedPurchase.getId());
            deliveryReq.setDriverId("mock-driver-purchase");
            deliveryReq.setPickupAddress("ConnectCamp Warehouse");

            // Try to get buyer's location from profile
            String buyerAddress = "TBD - Please update delivery address";
            if (buyer.getProfileDetails() != null && buyer.getProfileDetails().containsKey("location")) {
                buyerAddress = buyer.getProfileDetails().get("location").toString();
            }
            deliveryReq.setDeliveryAddress(buyerAddress);
            deliveryReq.setScheduledDate(LocalDate.now().plusDays(3));
            deliveryReq.setPriority(com.campconnect.delivery.model.DeliveryPriority.NORMAL);

            deliveryService.create(deliveryReq);
        } catch (Exception e) {
            // Log but don't fail the purchase
            System.err.println("Auto-delivery creation failed for purchase " + savedPurchase.getId() + ": " + e.getMessage());
        }

        return toResponse(savedPurchase);
    }

    // ---------- MAPPING ----------

    private PurchaseResponse toResponse(Purchase purchase) {
        return modelMapper.map(purchase, PurchaseResponse.class);
    }
}
