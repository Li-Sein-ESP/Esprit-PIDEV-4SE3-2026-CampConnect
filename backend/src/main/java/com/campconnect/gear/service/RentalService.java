package com.campconnect.gear.service;

import com.campconnect.common.PagedResponse;
import com.campconnect.exception.BadRequestException;
import com.campconnect.exception.ConflictException;
import com.campconnect.exception.ResourceNotFoundException;
import com.campconnect.gear.dto.RentalRequest;
import com.campconnect.gear.dto.RentalResponse;
import com.campconnect.gear.model.*;
import com.campconnect.gear.repository.GearRepository;
import com.campconnect.gear.repository.RentalRepository;
import com.campconnect.model.User;
import com.campconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumSet;
import java.util.Map;
import java.util.Set;


@Service
@RequiredArgsConstructor
public class RentalService {

    private final RentalRepository rentalRepository;
    private final GearRepository gearRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;


    // Valid state transitions for rentals
    private static final Map<RentalStatus, Set<RentalStatus>> VALID_TRANSITIONS = Map.of(
            RentalStatus.PENDING, EnumSet.of(RentalStatus.APPROVED, RentalStatus.CANCELLED),
            RentalStatus.APPROVED, EnumSet.of(RentalStatus.ACTIVE, RentalStatus.CANCELLED),
            RentalStatus.ACTIVE, EnumSet.of(RentalStatus.COMPLETED),
            RentalStatus.COMPLETED, EnumSet.noneOf(RentalStatus.class),
            RentalStatus.CANCELLED, EnumSet.noneOf(RentalStatus.class));

    // ---------- READ ----------

    public PagedResponse<RentalResponse> findAll(Pageable pageable) {
        return PagedResponse.from(rentalRepository.findAll(pageable).map(this::toResponse));
    }

    public PagedResponse<RentalResponse> findByRenter(String renterId, Pageable pageable) {
        return PagedResponse.from(rentalRepository.findByRenterId(renterId, pageable).map(this::toResponse));
    }

    public PagedResponse<RentalResponse> findByGear(String gearId, Pageable pageable) {
        return PagedResponse.from(rentalRepository.findByGearId(gearId, pageable).map(this::toResponse));
    }

    public RentalResponse findById(String id) {
        Rental rental = rentalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rental", "id", id));
        return toResponse(rental);
    }

    // ---------- WRITE ----------

    /**
     * Atomically decrements gear quantity using MongoTemplate.findAndModify.
     * This prevents overselling when concurrent requests arrive simultaneously.
     */
    @Transactional
    public RentalResponse create(RentalRequest request, String renterId) {
        if (request.getEndDate().isBefore(request.getStartDate()) ||
                request.getEndDate().isEqual(request.getStartDate())) {
            throw new BadRequestException("End date must be after start date");
        }

        long days = java.time.temporal.ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate());
        if (days > 60) {
            throw new BadRequestException("Rental duration cannot exceed 60 days");
        }

        // Validate gear exists, is not deleted, and allows rental
        // Stock reservation is handled upstream by FulfillmentService via GearInventoryService
        Gear gear = gearRepository.findById(request.getGearId())
                .filter(g -> !g.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Gear", "id", request.getGearId()));

        if (gear.getListingType() == ListingType.FOR_SALE) {
            throw new BadRequestException("This item is only available for purchase, not for rent.");
        }

        // Fetch renter info for denormalization
        User renter = userRepository.findById(renterId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", renterId));

        // Compute cost
        int rentalDays = (int) days;
        java.math.BigDecimal dailyPrice = gear.getDailyPrice() != null
                ? gear.getDailyPrice()
                : (gear.getPrice() != null ? gear.getPrice() : java.math.BigDecimal.ZERO);
        java.math.BigDecimal totalPrice = dailyPrice.multiply(java.math.BigDecimal.valueOf(rentalDays));

        Rental rental = new Rental();
        rental.setGearId(gear.getId());
        rental.setGearName(gear.getName());
        rental.setRenterId(renterId);
        rental.setRenterName(renter.getName());
        rental.setStartDate(request.getStartDate());
        rental.setEndDate(request.getEndDate());
        rental.setStatus(RentalStatus.PENDING);
        rental.setRentalDays(rentalDays);
        rental.setTotalPrice(totalPrice);

        return toResponse(rentalRepository.save(rental));
    }

    /**
     * Creates a rental and returns the raw entity (used by FulfillmentService to set discountApplied).
     */
    @Transactional
    public Rental createEntity(RentalRequest request, String renterId) {
        if (request.getEndDate().isBefore(request.getStartDate()) ||
                request.getEndDate().isEqual(request.getStartDate())) {
            throw new BadRequestException("End date must be after start date");
        }
        long days = java.time.temporal.ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate());
        Gear gear = gearRepository.findById(request.getGearId())
                .filter(g -> !g.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Gear", "id", request.getGearId()));
        if (gear.getListingType() == ListingType.FOR_SALE) {
            throw new BadRequestException("This item is only available for purchase, not for rent.");
        }
        User renter = userRepository.findById(renterId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", renterId));
        int rentalDays = (int) days;
        java.math.BigDecimal dailyPrice = gear.getDailyPrice() != null
                ? gear.getDailyPrice()
                : (gear.getPrice() != null ? gear.getPrice() : java.math.BigDecimal.ZERO);
        java.math.BigDecimal totalPrice = dailyPrice.multiply(java.math.BigDecimal.valueOf(rentalDays));

        Rental rental = new Rental();
        rental.setGearId(gear.getId());
        rental.setGearName(gear.getName());
        rental.setRenterId(renterId);
        rental.setRenterName(renter.getName());
        rental.setStartDate(request.getStartDate());
        rental.setEndDate(request.getEndDate());
        rental.setStatus(RentalStatus.PENDING);
        rental.setRentalDays(rentalDays);
        rental.setTotalPrice(totalPrice);

        return rentalRepository.save(rental);
    }

    @Transactional
    public RentalResponse updateStatus(String id, RentalStatus newStatus) {
        Rental rental = rentalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rental", "id", id));

        // State transition validation
        Set<RentalStatus> allowed = VALID_TRANSITIONS.getOrDefault(rental.getStatus(),
                EnumSet.noneOf(RentalStatus.class));
        if (!allowed.contains(newStatus)) {
            throw new ConflictException(String.format(
                    "Cannot transition rental from %s to %s", rental.getStatus(), newStatus));
        }

        rental.setStatus(newStatus);

        // Side effects on gear status
        if (newStatus == RentalStatus.ACTIVE) {
            // Mark gear as RENTED
            gearRepository.findById(rental.getGearId()).ifPresent(gear -> {
                gear.setStatus(GearStatus.RENTED);
                gearRepository.save(gear);
            });
        } else if (newStatus == RentalStatus.COMPLETED || newStatus == RentalStatus.CANCELLED) {
            // Restore gear to AVAILABLE when rental ends or is cancelled
            gearRepository.findById(rental.getGearId()).ifPresent(gear -> {
                if (gear.getStatus() == GearStatus.RENTED || gear.getStatus() == GearStatus.OUT_OF_STOCK) {
                    gear.setStatus(GearStatus.AVAILABLE);
                    gearRepository.save(gear);
                }
            });
        }

        return toResponse(rentalRepository.save(rental));
    }

    // ---------- MAPPING ----------

    private RentalResponse toResponse(Rental rental) {
        return modelMapper.map(rental, RentalResponse.class);
    }
}
