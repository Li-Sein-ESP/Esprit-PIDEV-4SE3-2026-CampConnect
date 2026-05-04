package com.campconnect.payment.service;

import com.campconnect.gear.model.Purchase;
import com.campconnect.gear.model.PurchaseStatus;
import com.campconnect.gear.dto.CheckoutRequest;
import com.campconnect.gear.repository.PurchaseRepository;
import com.campconnect.exception.ResourceNotFoundException;
import com.campconnect.model.User;
import com.campconnect.repository.UserRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.campconnect.gear.repository.CartRepository;
import com.campconnect.gear.service.CartService;
import com.campconnect.gear.model.CartItem;
import com.campconnect.gear.model.Cart;
import org.springframework.context.annotation.Lazy;
import com.campconnect.gear.repository.GearRepository;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;


@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PurchaseRepository purchaseRepository;
    private final CartRepository cartRepository;
    private final GearRepository gearRepository;
    private final UserRepository userRepository;

    @Lazy
    private final CartService cartService;

    public Map<String, String> createCheckoutSessionForPurchase(String purchaseId, String successUrl, String cancelUrl) throws StripeException {
        Purchase purchase = purchaseRepository.findById(purchaseId)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase", "id", purchaseId));

        long amountInCents = purchase.getTotalPrice().multiply(BigDecimal.valueOf(100)).longValue();

        SessionCreateParams params = SessionCreateParams.builder()
                .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(successUrl)
                .setCancelUrl(cancelUrl)
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setQuantity(1L)
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency("usd")
                                                .setUnitAmount(amountInCents)
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName(purchase.getGearName() + " (Qty: " + purchase.getQuantity() + ")")
                                                                .build()
                                                )
                                                .build()
                                )
                                .build()
                )
                .putMetadata("purchaseId", purchaseId)
                .build();

        Session session = Session.create(params);

        purchase.setCheckoutSessionId(session.getId());
        purchase.setPaymentStatus("PENDING");
        purchaseRepository.save(purchase);

        Map<String, String> responseData = new HashMap<>();
        responseData.put("sessionId", session.getId());
        responseData.put("checkoutUrl", session.getUrl());
        return responseData;
    }

    public Map<String, String> createCheckoutSessionForCart(String cartId, CheckoutRequest checkoutRequest, String successUrl, String cancelUrl) throws StripeException {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "id", cartId));

        if (checkoutRequest != null) {
            cart.setCheckoutDeliveryMethod(checkoutRequest.getDeliveryMethod() != null ? checkoutRequest.getDeliveryMethod().name() : null);
            cart.setCheckoutDeliveryType(checkoutRequest.getDeliveryType() != null ? checkoutRequest.getDeliveryType().name() : null);
            cart.setCheckoutDeliveryAddress(checkoutRequest.getDeliveryAddress());
            cart.setCheckoutCustomerLat(checkoutRequest.getCustomerLat());
            cart.setCheckoutCustomerLng(checkoutRequest.getCustomerLng());
            cart.setCheckoutPickupWarehouseId(checkoutRequest.getPickupWarehouseId());
            cartRepository.save(cart);
        }

        if (cart.getItems().isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }

        SessionCreateParams.Builder sessionBuilder = SessionCreateParams.builder()
                .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(successUrl)
                .setCancelUrl(cancelUrl)
                .putMetadata("cartId", cartId);

        for (CartItem item : cart.getItems()) {
            // Include deposit in the upfront cost
            BigDecimal itemTotal = item.getLineTotal().add(item.getDeposit() != null ? item.getDeposit() : BigDecimal.ZERO);
            long amountInCents = itemTotal.multiply(BigDecimal.valueOf(100)).longValue();
            
            // Get gear name for display
            String gearName = gearRepository.findById(item.getGearId()).map(g -> g.getName()).orElse("Gear Item");
            String description = (item.getItemType() == com.campconnect.gear.model.CartItemType.RENT) ? "Rental" : "Purchase";

            sessionBuilder.addLineItem(
                    SessionCreateParams.LineItem.builder()
                            .setQuantity(1L)
                            .setPriceData(
                                    SessionCreateParams.LineItem.PriceData.builder()
                                            .setCurrency("usd")
                                            .setUnitAmount(amountInCents)
                                            .setProductData(
                                                    SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                            .setName(gearName + " (" + description + ")")
                                                            .build()
                                            )
                                            .build()
                            )
                            .build()
            );
        }

        Session session = Session.create(sessionBuilder.build());

        Map<String, String> responseData = new HashMap<>();
        responseData.put("sessionId", session.getId());
        responseData.put("checkoutUrl", session.getUrl());
        return responseData;
    }

    public Map<String, Object> handlePaymentSuccess(String sessionId) throws StripeException {
        // Retrieve session to ensure payment succeeded
        Session session = Session.retrieve(sessionId);

        if ("paid".equals(session.getPaymentStatus())) {
            Map<String, String> metadata = session.getMetadata();

            if (metadata == null || metadata.isEmpty()) {
                throw new IllegalArgumentException("Missing payment metadata on Stripe session");
            }
            
            if (metadata.containsKey("purchaseId")) {
                String purchaseId = metadata.get("purchaseId");
                Purchase purchase = purchaseRepository.findById(purchaseId)
                        .orElseThrow(() -> new ResourceNotFoundException("Purchase", "id", purchaseId));

                boolean alreadyProcessed = "PAID".equalsIgnoreCase(purchase.getPaymentStatus());

                if (!alreadyProcessed) {
                    purchase.setPaymentStatus("PAID");
                    purchase.setPaymentIntentId(session.getPaymentIntent());
                    purchase.setStatus(PurchaseStatus.CONFIRMED);
                    purchase = purchaseRepository.save(purchase);
                }

                Map<String, Object> receipt = baseReceipt(session, alreadyProcessed ? "ALREADY_PROCESSED" : "SUCCESS");
                receipt.put("referenceType", "PURCHASE");
                receipt.put("referenceId", purchase.getId());
                receipt.put("purchaseId", purchase.getId());
                receipt.put("gearName", purchase.getGearName());
                receipt.put("quantity", purchase.getQuantity());
                receipt.put("buyerName", purchase.getBuyerName());
                receipt.put("purchaseStatus", purchase.getStatus() != null ? purchase.getStatus().name() : null);
                return receipt;
            } else if (metadata.containsKey("cartId")) {
                String cartId = metadata.get("cartId");
                Cart cart = cartRepository.findById(cartId)
                        .orElseThrow(() -> new ResourceNotFoundException("Cart", "id", cartId));

                boolean alreadyProcessed = cart.getItems() == null || cart.getItems().isEmpty();
                int processedItems = cart.getItems() != null ? cart.getItems().size() : 0;
                boolean fulfillmentDelayed = false;

                // Capture buyer name and gear names BEFORE the cart is cleared
                String buyerName = userRepository.findById(cart.getUserId())
                        .map(User::getName).orElse("Unknown Buyer");

                List<Map<String, Object>> gearItems = cart.getItems() != null
                        ? cart.getItems().stream().map(item -> {
                            Map<String, Object> g = new HashMap<>();
                            String name = gearRepository.findById(item.getGearId())
                                    .map(gear -> gear.getName()).orElse(item.getGearId());
                            g.put("gearName", name);
                            g.put("quantity", item.getQuantity());
                            g.put("type", item.getItemType() != null ? item.getItemType().name() : "?");
                            g.put("lineTotal", item.getLineTotal());
                            return g;
                        }).collect(Collectors.toList())
                        : new ArrayList<>();

                if (!alreadyProcessed) {
                    CheckoutRequest checkoutRequest = new CheckoutRequest();
                    if (cart.getCheckoutDeliveryMethod() != null) {
                        checkoutRequest.setDeliveryMethod(com.campconnect.delivery.model.DeliveryMethod.valueOf(cart.getCheckoutDeliveryMethod()));
                    }
                    if (cart.getCheckoutDeliveryType() != null) {
                        checkoutRequest.setDeliveryType(com.campconnect.delivery.model.DeliveryType.valueOf(cart.getCheckoutDeliveryType()));
                    }
                    checkoutRequest.setDeliveryAddress(cart.getCheckoutDeliveryAddress());
                    checkoutRequest.setCustomerLat(cart.getCheckoutCustomerLat());
                    checkoutRequest.setCustomerLng(cart.getCheckoutCustomerLng());
                    checkoutRequest.setPickupWarehouseId(cart.getCheckoutPickupWarehouseId());

                    try {
                        cartService.processPaidCart(cart, checkoutRequest);
                    } catch (Exception e) {
                        fulfillmentDelayed = true;
                        if (cart.getItems() != null && !cart.getItems().isEmpty()) {
                            cart.getItems().clear();
                            cartRepository.save(cart);
                        }
                        System.err.println("Paid cart fulfillment delayed for cart " + cartId + ": " + e.getMessage());
                    }
                }

                Map<String, Object> receipt = baseReceipt(session, alreadyProcessed ? "ALREADY_PROCESSED" : "SUCCESS");
                receipt.put("referenceType", "CART");
                receipt.put("referenceId", cartId);
                receipt.put("cartId", cartId);
                receipt.put("processedItems", processedItems);
                receipt.put("fulfillmentDelayed", fulfillmentDelayed);
                receipt.put("buyerName", buyerName);
                receipt.put("gearItems", gearItems);
                if (fulfillmentDelayed) {
                    receipt.put("message", "Payment confirmed. Order fulfillment is queued and your cart has been cleared.");
                }
                return receipt;
            }

            throw new IllegalArgumentException("Unsupported payment metadata. Expected purchaseId or cartId");
        }
        
        throw new RuntimeException("Payment not confirmed by Stripe");
    }

    private Map<String, Object> baseReceipt(Session session, String status) {
        Map<String, Object> receipt = new HashMap<>();
        long amountCents = session.getAmountTotal() != null ? session.getAmountTotal() : 0L;
        receipt.put("status", status);
        receipt.put("message", "ALREADY_PROCESSED".equals(status)
                ? "Payment already processed. Showing your receipt."
                : "Payment confirmed successfully.");
        receipt.put("sessionId", session.getId());
        receipt.put("paymentIntentId", session.getPaymentIntent());
        receipt.put("paymentStatus", session.getPaymentStatus());
        receipt.put("currency", session.getCurrency());
        receipt.put("amountTotalCents", amountCents);
        receipt.put("amountTotal", BigDecimal.valueOf(amountCents).movePointLeft(2));
        receipt.put("createdAt", DateTimeFormatter.ISO_OFFSET_DATE_TIME
                .format(Instant.ofEpochSecond(session.getCreated()).atOffset(ZoneOffset.UTC)));
        return receipt;
    }
}
