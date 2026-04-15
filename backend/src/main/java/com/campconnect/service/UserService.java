package com.campconnect.service;

import com.campconnect.dto.ChangePasswordRequest;
import com.campconnect.dto.UpdateProfileRequest;
import com.campconnect.dto.UserProfileResponse;
import com.campconnect.dto.UserStatsResponse;
import com.campconnect.exception.BadRequestException;
import com.campconnect.exception.ResourceNotFoundException;
import com.campconnect.model.User;
import com.campconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.campconnect.repository.ReservationRepository reservationRepository;
    private final com.campconnect.gear.repository.RentalRepository rentalRepository;
    private final com.campconnect.gear.repository.PurchaseRepository purchaseRepository;

    public UserProfileResponse getProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return toResponse(user);
    }

    @Transactional
    public UserProfileResponse updateProfile(String userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (request.getName() != null) {
            user.setName(request.getName());
        }

        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new BadRequestException("Email already in use");
            }
            user.setEmail(request.getEmail());
        }

        if (request.getProfileDetails() != null) {
            if (user.getProfileDetails() == null) {
                user.setProfileDetails(new HashMap<>());
            }
            user.getProfileDetails().putAll(request.getProfileDetails());
        }

        return toResponse(userRepository.save(user));
    }

    @Transactional
    public void changePassword(String userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private UserProfileResponse toResponse(User user) {
        UserProfileResponse response = new UserProfileResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setName(user.getName());
        response.setRoles(user.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(Collectors.toList()));
        response.setProfileDetails(user.getProfileDetails());
        response.setCreatedAt(user.getCreatedAt());
        return response;
    }

    public UserStatsResponse getUserStats(String userId) {
        // Count completed reservations (assuming COMPLETED status exists)
        long campsitesVisited = reservationRepository.countByUserIdAndStatus(userId, 
                com.campconnect.model.ReservationStatus.COMPLETED);
        
        // Count active reservations
        long activeReservations = reservationRepository.countByUserIdAndStatus(userId, 
                com.campconnect.model.ReservationStatus.CONFIRMED);
        
        // Count gear rentals (all statuses except CANCELLED)
        long gearRented = rentalRepository.findAll().stream()
                .filter(r -> r.getRenterId() != null && r.getRenterId().equals(userId))
                .filter(r -> r.getStatus() != com.campconnect.gear.model.RentalStatus.CANCELLED)
                .count();
        
        // Count active rentals
        long activeRentals = rentalRepository.findAll().stream()
                .filter(r -> r.getRenterId() != null && r.getRenterId().equals(userId))
                .filter(r -> r.getStatus() == com.campconnect.gear.model.RentalStatus.ACTIVE)
                .count();
        
        // Count gear purchases
        long gearPurchased = purchaseRepository.findAll().stream()
                .filter(p -> p.getBuyerId() != null && p.getBuyerId().equals(userId))
                .count();
        
        // For trips and reviews, we'll return 0 for now as those systems aren't integrated yet
        long tripsCompleted = 0L;
        long reviewsGiven = 0L;
        
        return UserStatsResponse.builder()
                .tripsCompleted(tripsCompleted)
                .campsitesVisited(campsitesVisited)
                .reviewsGiven(reviewsGiven)
                .gearRented(gearRented)
                .gearPurchased(gearPurchased)
                .activeReservations(activeReservations)
                .activeRentals(activeRentals)
                .build();
    }
}
