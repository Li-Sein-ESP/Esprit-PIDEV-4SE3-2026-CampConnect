package com.campconnect.gear.service;

import com.campconnect.exception.BadRequestException;
import com.campconnect.exception.ResourceNotFoundException;
import com.campconnect.gear.dto.CheckoutRequest;
import com.campconnect.gear.dto.*;
import com.campconnect.gear.model.*;
import com.campconnect.gear.repository.CartRepository;
import com.campconnect.gear.repository.GearRepository;
import com.campconnect.model.FidelityTier;
import com.campconnect.model.User;
import com.campconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final GearRepository gearRepository;
    private final UserRepository userRepository;
    private final RentalService rentalService;
    private final PurchaseService purchaseService;
    private final com.campconnect.delivery.service.DeliveryService deliveryService;
    private final FulfillmentService fulfillmentService;

    // Use PurchaseService if available. Using GearService directly if
    // PurchaseService is injected there
    // private final GearService gearService; // Removed as PurchaseService is now
    // injected

    public CartResponse getCart(String userId) {
        Cart cart = findOrCreateCart(userId);
        return toResponse(cart);
    }

    public Cart getCartEntity(String userId) {
        return findOrCreateCart(userId);
    }

    @Transactional
    public CartResponse addToCart(String userId, CartRequest request) {
        Cart cart = findOrCreateCart(userId);

        String gearId = request.getGearId();
        if (gearId == null) {
            throw new BadRequestException("Gear ID is required");
        }

        Gear gear = gearRepository.findById(gearId)
                .orElseThrow(() -> new ResourceNotFoundException("Gear", "id", gearId));

        if (gear.getStatus() != GearStatus.AVAILABLE) {
            throw new BadRequestException("Gear is not available");
        }

        CartItem item = new CartItem();
        item.setId(UUID.randomUUID().toString());
        item.setGearId(gear.getId());
        item.setItemType(request.getItemType());
        item.setQuantity(request.getQuantity());
        item.setRequiresDelivery(request.isRequiresDelivery());
        item.setDeliveryAddress(request.getDeliveryAddress());

        BigDecimal unitPrice;
        BigDecimal lineTotal;
        BigDecimal deposit = BigDecimal.ZERO;

        if (request.getItemType() == CartItemType.RENT) {
            if (gear.getListingType() == ListingType.FOR_SALE) {
                throw new BadRequestException("This item is only available for purchase");
            }
            if (request.getStartDate() == null || request.getEndDate() == null) {
                throw new BadRequestException("Start date and end date are required for rentals");
            }
            if (!request.getEndDate().isAfter(request.getStartDate())) {
                throw new BadRequestException("End date must be after start date");
            }

            long days = java.time.temporal.ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate());
            item.setStartDate(request.getStartDate());
            item.setEndDate(request.getEndDate());
            item.setRentalDays((int) days);

            unitPrice = gear.getDailyPrice() != null ? gear.getDailyPrice() : gear.getPrice();
            lineTotal = unitPrice.multiply(BigDecimal.valueOf(days))
                    .multiply(BigDecimal.valueOf(request.getQuantity()));
            deposit = new BigDecimal("150.00"); // Hardcoded deposit for prototype
        } else {
            if (gear.getListingType() == ListingType.FOR_RENT) {
                throw new BadRequestException("This item is only available for rent");
            }
            unitPrice = gear.getSalePrice() != null ? gear.getSalePrice() : BigDecimal.ZERO;
            lineTotal = unitPrice.multiply(BigDecimal.valueOf(request.getQuantity()));
        }

        item.setUnitPrice(unitPrice);
        item.setDeposit(deposit);
        item.setLineTotal(lineTotal);

        cart.getItems().add(item);

        return toResponse(recalculateAndSave(cart));
    }

    @Transactional
    public CartResponse removeFromCart(String userId, String itemId) {
        Cart cart = findOrCreateCart(userId);
        cart.getItems().removeIf(item -> item.getId().equals(itemId));
        return toResponse(recalculateAndSave(cart));
    }

    @Transactional
    public CartResponse updateDeliveryLocation(String userId, CartRequest request) {
        Cart cart = findOrCreateCart(userId);
        cart.getItems().forEach(item -> {
            item.setRequiresDelivery(request.isRequiresDelivery());
            item.setDeliveryAddress(request.getDeliveryAddress());
            item.setCustomerLat(request.getCustomerLat());
            item.setCustomerLng(request.getCustomerLng());
        });
        return toResponse(recalculateAndSave(cart));
    }

    @Transactional
    public void processPaidCart(Cart cart, CheckoutRequest checkoutRequest) {
        fulfillmentService.fulfillPaidCart(cart, checkoutRequest);
        cart.getItems().clear();
        recalculateAndSave(cart);
    }

    private Cart findOrCreateCart(String userId) {
        if (userId == null) {
            throw new BadRequestException("User ID is required for cart operations");
        }
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUserId(userId);
                    return cartRepository.save(newCart);
                });
    }

    private Cart recalculateAndSave(Cart cart) {
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal totalDeposit = BigDecimal.ZERO;

        boolean requiresDelivery = false;

        for (CartItem item : cart.getItems()) {
            subtotal = subtotal.add(item.getLineTotal() != null ? item.getLineTotal() : BigDecimal.ZERO);
            totalDeposit = totalDeposit.add(item.getDeposit() != null ? item.getDeposit() : BigDecimal.ZERO);
            if (item.isRequiresDelivery()) {
                requiresDelivery = true;
            }
        }

        BigDecimal discountAmount = BigDecimal.ZERO;
        BigDecimal deliveryFee = BigDecimal.ZERO;

        if (requiresDelivery) {
            deliveryFee = new BigDecimal("15.00"); // Base delivery fee
        }

        if (cart.getUserId() != null) {
            User user = userRepository.findById(cart.getUserId()).orElse(null);
            if (user != null && user.getFidelityTier() != null) {
                FidelityTier tier = user.getFidelityTier();
                discountAmount = subtotal.multiply(BigDecimal.valueOf(tier.getDiscountRate()));
                
                if (tier == FidelityTier.GOLD || tier == FidelityTier.PLATINUM) {
                    deliveryFee = BigDecimal.ZERO;
                }
            }
        }

        cart.setSubtotal(subtotal);
        cart.setTotalDeposit(totalDeposit);
        cart.setDiscountAmount(discountAmount);
        cart.setDeliveryFee(deliveryFee);
        
        BigDecimal grandTotal = subtotal.subtract(discountAmount).add(totalDeposit).add(deliveryFee);
        cart.setGrandTotal(grandTotal.max(BigDecimal.ZERO));

        return cartRepository.save(cart);
    }

    private CartResponse toResponse(Cart cart) {
        CartResponse response = new CartResponse();
        response.setId(cart.getId());
        response.setUserId(cart.getUserId());
        response.setSubtotal(cart.getSubtotal());
        response.setTotalDeposit(cart.getTotalDeposit());
        response.setDiscountAmount(cart.getDiscountAmount());
        response.setDeliveryFee(cart.getDeliveryFee());
        response.setGrandTotal(cart.getGrandTotal());

        List<CartItemResponse> itemResponses = cart.getItems().stream().map(item -> {
            CartItemResponse res = new CartItemResponse();
            res.setId(item.getId());
            res.setGearId(item.getGearId());
            res.setItemType(item.getItemType());
            res.setQuantity(item.getQuantity());
            res.setStartDate(item.getStartDate());
            res.setEndDate(item.getEndDate());
            res.setRentalDays(item.getRentalDays());
            res.setUnitPrice(item.getUnitPrice());
            res.setDeposit(item.getDeposit());
            res.setLineTotal(item.getLineTotal());

            // Fetch Gear info for UI
            gearRepository.findById(item.getGearId()).ifPresent(gear -> {
                res.setGearName(gear.getName());
                res.setGearCategory(gear.getCategory());
                res.setGearCondition(gear.getCondition());
                if (gear.getImages() != null && !gear.getImages().isEmpty()) {
                    res.setGearImage(gear.getImages().get(0).getImageUrl());
                } else {
                    res.setGearImage("https://images.unsplash.com/photo-1525811902-f2342640856e?w=800&q=80"); // fallback
                }
            });

            return res;
        }).collect(Collectors.toList());

        response.setItems(itemResponses);
        return response;
    }
}
