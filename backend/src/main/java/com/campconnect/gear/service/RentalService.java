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
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
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
    private final MongoTemplate mongoTemplate;
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

        Gear gearCheck = gearRepository.findById(request.getGearId())
                .orElseThrow(() -> new ResourceNotFoundException("Gear", "id", request.getGearId()));

        // Validate that the item allows rental
        if (gearCheck.getListingType() == ListingType.FOR_SALE) {
            throw new BadRequestException("This item is only available for purchase, not for rent.");
        }

        if (gearCheck.getQuantity() == 1) {
            Query overlapQuery = new Query(
                    Criteria.where("gearId").is(request.getGearId())
                            .and("status").in(RentalStatus.PENDING, RentalStatus.APPROVED, RentalStatus.ACTIVE)
                            .and("startDate").lte(request.getEndDate())
                            .and("endDate").gte(request.getStartDate()));
            if (mongoTemplate.exists(overlapQuery, Rental.class)) {
                throw new ConflictException("Gear is already rented for the selected dates");
            }
        }

        // ATOMIC: find gear where status=AVAILABLE AND quantity>0, then decrement
        Query atomicQuery = new Query(
                Criteria.where("_id").is(request.getGearId())
                        .and("status").is(GearStatus.AVAILABLE)
                        .and("quantity").gt(0)
                        .and("deleted").is(false));
        Update atomicUpdate = new Update().inc("quantity", -1);
        Gear updatedGear = mongoTemplate.findAndModify(atomicQuery, atomicUpdate, Gear.class);

        if (updatedGear == null) {
            throw new BadRequestException(
                    "Gear is not available for rental. It may be out of stock or already booked.");
        }

        // If quantity after decrement is 0, mark as OUT_OF_STOCK
        if (updatedGear.getQuantity() - 1 == 0) {
            Query statusQuery = new Query(Criteria.where("_id").is(updatedGear.getId()));
            mongoTemplate.updateFirst(statusQuery,
                    new Update().set("status", GearStatus.OUT_OF_STOCK), Gear.class);
        }

        // Fetch renter info for denormalization
        User renter = userRepository.findById(renterId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", renterId));

        // Compute cost
        int rentalDays = (int) days;
        java.math.BigDecimal dailyPrice = updatedGear.getDailyPrice() != null
                ? updatedGear.getDailyPrice()
                : (updatedGear.getPrice() != null ? updatedGear.getPrice() : java.math.BigDecimal.ZERO);
        java.math.BigDecimal totalPrice = dailyPrice.multiply(java.math.BigDecimal.valueOf(rentalDays));

        Rental rental = new Rental();
        rental.setGearId(updatedGear.getId());
        rental.setGearName(updatedGear.getName());
        rental.setRenterId(renterId);
        rental.setRenterName(renter.getName());
        rental.setStartDate(request.getStartDate());
        rental.setEndDate(request.getEndDate());
        rental.setStatus(RentalStatus.PENDING);
        rental.setRentalDays(rentalDays);
        rental.setTotalPrice(totalPrice);

        return toResponse(rentalRepository.save(rental));
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
            Query q = new Query(Criteria.where("_id").is(rental.getGearId()));
            mongoTemplate.updateFirst(q, new Update().set("status", GearStatus.RENTED), Gear.class);
        } else if (newStatus == RentalStatus.COMPLETED || newStatus == RentalStatus.CANCELLED) {
            // Return quantity atomically
            Query q = new Query(Criteria.where("_id").is(rental.getGearId()));
            mongoTemplate.findAndModify(q, new Update().inc("quantity", 1), Gear.class);
            // Check if we should restore to AVAILABLE
            Gear gear = gearRepository.findById(rental.getGearId()).orElse(null);
            if (gear != null
                    && (gear.getStatus() == GearStatus.OUT_OF_STOCK || gear.getStatus() == GearStatus.RENTED)) {
                int restoredQty = gear.getQuantity() + 1;
                if (restoredQty > 0) {
                    mongoTemplate.updateFirst(q, new Update().set("status", GearStatus.AVAILABLE), Gear.class);
                }
            }
        }

        return toResponse(rentalRepository.save(rental));
    }

    // ---------- MAPPING ----------

    private RentalResponse toResponse(Rental rental) {
        return modelMapper.map(rental, RentalResponse.class);
    }
}
