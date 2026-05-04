package com.campconnect.service;

import com.campconnect.gear.model.Purchase;
import com.campconnect.gear.model.Rental;
import com.campconnect.gear.repository.PurchaseRepository;
import com.campconnect.gear.repository.RentalRepository;
import com.campconnect.model.FidelityTier;
import com.campconnect.model.User;
import com.campconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class LoyaltyService {

    private final UserRepository userRepository;
    private final PurchaseRepository purchaseRepository;
    private final RentalRepository rentalRepository;

    public void updateTier(String userId) {
        if (userId == null) return;
        
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                log.warn("LoyaltyService: User not found for id {}", userId);
                return;
            }

            List<Purchase> purchases = purchaseRepository.findCompletedPurchasesByBuyerId(userId);
            BigDecimal purchaseSum = purchases.stream()
                    .map(p -> p.getTotalPrice() != null ? p.getTotalPrice() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            List<Rental> rentals = rentalRepository.findCompletedRentalsByRenterId(userId);
            BigDecimal rentalSum = rentals.stream()
                    .map(r -> r.getTotalPrice() != null ? r.getTotalPrice() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal totalSpent = purchaseSum.add(rentalSum);
            user.setTotalSpent(totalSpent.doubleValue());

            FidelityTier calculatedTier;
            double sum = totalSpent.doubleValue();
            if (sum >= 2000.0) {
                calculatedTier = FidelityTier.PLATINUM;
            } else if (sum >= 1000.0) {
                calculatedTier = FidelityTier.GOLD;
            } else if (sum >= 500.0) {
                calculatedTier = FidelityTier.SILVER;
            } else {
                calculatedTier = FidelityTier.BRONZE;
            }

            // Only upgrade, never downgrade
            if (user.getFidelityTier() == null || calculatedTier.ordinal() > user.getFidelityTier().ordinal()) {
                user.setFidelityTier(calculatedTier);
                log.info("LoyaltyService: User {} upgraded to tier {}", userId, calculatedTier);
            }

            userRepository.save(user);
        } catch (Exception e) {
            log.error("LoyaltyService: Failed to update tier for user {}. Error: {}", userId, e.getMessage());
        }
    }
}
