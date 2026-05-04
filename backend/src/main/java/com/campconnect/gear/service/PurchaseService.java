package com.campconnect.gear.service;

import com.campconnect.common.PagedResponse;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;


@Service
@RequiredArgsConstructor
public class PurchaseService {

    private final PurchaseRepository purchaseRepository;
    private final GearRepository gearRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;


    // ---------- READ ----------

    public PagedResponse<PurchaseResponse> findByBuyer(String buyerId, Pageable pageable) {
        return PagedResponse.from(
                purchaseRepository.findByBuyerId(buyerId, pageable).map(this::toResponse));
    }

    public PurchaseResponse findById(String id) {
        return purchaseRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase", "id", id));
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

        // Validate gear exists and allows purchase
        // Stock reservation is handled upstream by FulfillmentService via GearInventoryService
        Gear gear = gearRepository.findById(gearId)
                .filter(g -> !g.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Gear", "id", gearId));

        if (gear.getListingType() == ListingType.FOR_RENT) {
            throw new BadRequestException("This item is only available for rent, not for purchase.");
        }

        if (gear.getSalePrice() == null) {
            throw new BadRequestException("This item does not have a sale price set.");
        }

        int qty = request.getQuantity();

        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", buyerId));

        BigDecimal unitPrice = gear.getSalePrice();
        BigDecimal totalPrice = unitPrice.multiply(BigDecimal.valueOf(qty));

        Purchase purchase = new Purchase();
        purchase.setGearId(gear.getId());
        purchase.setGearName(gear.getName());
        purchase.setBuyerId(buyerId);
        purchase.setBuyerName(buyer.getName());
        purchase.setQuantity(qty);
        purchase.setUnitPrice(unitPrice);
        purchase.setTotalPrice(totalPrice);
        purchase.setStatus(PurchaseStatus.CONFIRMED);

        return toResponse(purchaseRepository.save(purchase));
    }

    /**
     * Creates a purchase and returns the raw entity (used by FulfillmentService to set discountApplied).
     */
    @Transactional
    public Purchase createEntity(PurchaseRequest request, String buyerId) {
        String gearId = request.getGearId();
        if (gearId == null) throw new BadRequestException("Gear ID is required to make a purchase");
        Gear gear = gearRepository.findById(gearId)
                .filter(g -> !g.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Gear", "id", gearId));
        if (gear.getListingType() == ListingType.FOR_RENT)
            throw new BadRequestException("This item is only available for rent, not for purchase.");
        if (gear.getSalePrice() == null)
            throw new BadRequestException("This item does not have a sale price set.");
        int qty = request.getQuantity();
        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", buyerId));
        BigDecimal unitPrice = gear.getSalePrice();
        BigDecimal totalPrice = unitPrice.multiply(BigDecimal.valueOf(qty));
        Purchase purchase = new Purchase();
        purchase.setGearId(gear.getId());
        purchase.setGearName(gear.getName());
        purchase.setBuyerId(buyerId);
        purchase.setBuyerName(buyer.getName());
        purchase.setQuantity(qty);
        purchase.setUnitPrice(unitPrice);
        purchase.setTotalPrice(totalPrice);
        purchase.setStatus(PurchaseStatus.CONFIRMED);
        return purchaseRepository.save(purchase);
    }


    // ---------- MAPPING ----------

    private PurchaseResponse toResponse(Purchase purchase) {
        return modelMapper.map(purchase, PurchaseResponse.class);
    }
}
