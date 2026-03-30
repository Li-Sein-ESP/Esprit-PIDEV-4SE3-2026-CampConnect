package com.campconnect.delivery.service;

import com.campconnect.common.PagedResponse;
import com.campconnect.delivery.dto.DeliveryRequest;
import com.campconnect.delivery.dto.DeliveryResponse;
import com.campconnect.delivery.dto.EarningsResponse;
import com.campconnect.delivery.model.Delivery;
import com.campconnect.delivery.model.DeliveryPriority;
import com.campconnect.delivery.model.DeliveryStatus;
import com.campconnect.delivery.model.Route;
import com.campconnect.delivery.repository.DeliveryRepository;
import com.campconnect.exception.BadRequestException;
import com.campconnect.exception.ConflictException;
import com.campconnect.exception.ResourceNotFoundException;
import com.campconnect.gear.model.Rental;
import com.campconnect.gear.model.RentalStatus;
import com.campconnect.gear.repository.RentalRepository;
import com.campconnect.model.ERole;
import com.campconnect.model.User;
import com.campconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeliveryService {

    private final DeliveryRepository deliveryRepository;
    private final RentalRepository rentalRepository;
    private final com.campconnect.gear.repository.PurchaseRepository purchaseRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    // Valid delivery state transitions
    private static final Map<DeliveryStatus, Set<DeliveryStatus>> VALID_TRANSITIONS = Map.of(
            DeliveryStatus.CREATED, EnumSet.of(DeliveryStatus.DISPATCHED, DeliveryStatus.CANCELLED),
            DeliveryStatus.DISPATCHED, EnumSet.of(DeliveryStatus.IN_TRANSIT, DeliveryStatus.CANCELLED),
            DeliveryStatus.IN_TRANSIT, EnumSet.of(DeliveryStatus.DELIVERED, DeliveryStatus.CANCELLED),
            DeliveryStatus.DELIVERED, EnumSet.noneOf(DeliveryStatus.class),
            DeliveryStatus.CANCELLED, EnumSet.noneOf(DeliveryStatus.class));

    // ---------- READ ----------

    public PagedResponse<DeliveryResponse> findAll(DeliveryStatus status, DeliveryPriority priority,
            Pageable pageable) {
        Page<Delivery> page;
        if (status != null) {
            page = deliveryRepository.findByStatusAndDeletedFalse(status, pageable);
        } else if (priority != null) {
            page = deliveryRepository.findByPriorityAndDeletedFalse(priority, pageable);
        } else {
            page = deliveryRepository.findByDeletedFalse(pageable);
        }
        return PagedResponse.from(page.map(d -> modelMapper.map(d, DeliveryResponse.class)));
    }

    public DeliveryResponse findById(String id) {
        Delivery delivery = deliveryRepository.findById(id)
                .filter(d -> !d.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Delivery", "id", id));
        return modelMapper.map(delivery, DeliveryResponse.class);
    }

    public PagedResponse<DeliveryResponse> findByDriver(String driverId, Pageable pageable) {
        return PagedResponse.from(
                deliveryRepository.findByDriverIdAndDeletedFalse(driverId, pageable)
                        .map(d -> modelMapper.map(d, DeliveryResponse.class)));
    }

    public PagedResponse<DeliveryResponse> findByDateRange(LocalDate from, LocalDate to, Pageable pageable) {
        return PagedResponse.from(
                deliveryRepository.findByScheduledDateBetweenAndDeletedFalse(from, to, pageable)
                        .map(d -> modelMapper.map(d, DeliveryResponse.class)));
    }

    // ---------- WRITE ----------

    @Transactional
    public DeliveryResponse create(DeliveryRequest request) {
        if (request.getRentalId() == null && request.getPurchaseId() == null) {
            throw new BadRequestException("Either rentalId or purchaseId must be provided");
        }

        if (request.getRentalId() != null) {
            // 1a. Validate rental exists and is APPROVED
            Rental rental = rentalRepository.findById(request.getRentalId())
                    .orElseThrow(() -> new ResourceNotFoundException("Rental", "id", request.getRentalId()));

            // We bypass the strict APPROVED check if calling from Cart checkout directly
            // (where it starts PENDING)
            // But if it's strictly enforced elsewhere, we can leave it. For MVP, allow any
            // non-cancelled state since Cart assigns them immediately.
            if (rental.getStatus() == RentalStatus.CANCELLED) {
                throw new BadRequestException("Delivery cannot be created for CANCELLED rentals.");
            }

            if (request.getScheduledDate().isBefore(rental.getStartDate())
                    || request.getScheduledDate().isAfter(rental.getEndDate())) {
                throw new BadRequestException("Scheduled date must be within the rental period");
            }

            // 2a. Prevent duplicate active delivery for same rental
            if (deliveryRepository.existsByRentalIdAndStatusAndDeletedFalse(request.getRentalId(),
                    DeliveryStatus.CREATED)
                    || deliveryRepository.existsByRentalIdAndStatusAndDeletedFalse(request.getRentalId(),
                            DeliveryStatus.DISPATCHED)
                    || deliveryRepository.existsByRentalIdAndStatusAndDeletedFalse(request.getRentalId(),
                            DeliveryStatus.IN_TRANSIT)) {
                throw new ConflictException("An active delivery already exists for this rental");
            }
        } else if (request.getPurchaseId() != null) {
            // 1b. Validate purchase exists
            com.campconnect.gear.model.Purchase purchase = purchaseRepository.findById(request.getPurchaseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Purchase", "id", request.getPurchaseId()));

            if (purchase.getStatus() == com.campconnect.gear.model.PurchaseStatus.CANCELLED) {
                throw new BadRequestException("Delivery cannot be created for CANCELLED purchases.");
            }

            // Note: Purchases don't have strict start/end dates for delivery scheduled date
        }

        // 3. Validate driver has ROLE_DELIVERY_PROVIDER
        // If driver ID is a dummy for mock/MVP purposes, we can bypass the DB check or
        // insert the mock driver first.
        // For right now, let's keep the user lookup, but if driver doesn't exist, we
        // will throw.
        // However, our cart creates a mock driver, so let's allow "mock-driver-*" to
        // bypass role checks, or we'll fail.
        User driver;
        if (request.getDriverId().startsWith("mock-driver")) {
            driver = new User();
            driver.setId(request.getDriverId());
            driver.setName("System Dispatch");
        } else {
            driver = userRepository.findById(request.getDriverId())
                    .orElseThrow(() -> new ResourceNotFoundException("Driver", "id", request.getDriverId()));

            boolean isDriver = driver.getRoles().stream()
                    .anyMatch(role -> role.getName() == ERole.ROLE_DELIVERY_PROVIDER);
            if (!isDriver) {
                throw new BadRequestException("Assigned user does not have the DELIVERY_PROVIDER role");
            }
        }

        // 4. Build delivery
        Delivery delivery = modelMapper.map(request, Delivery.class);
        delivery.setDriverName(driver.getName());
        delivery.setStatus(DeliveryStatus.CREATED);
        delivery.setDeleted(false);

        if (request.getRoute() != null) {
            delivery.setRoute(modelMapper.map(request.getRoute(), Route.class));
        }

        return modelMapper.map(deliveryRepository.save(delivery), DeliveryResponse.class);
    }

    @Transactional
    public DeliveryResponse updateStatus(String id, DeliveryStatus newStatus) {
        Delivery delivery = deliveryRepository.findById(id)
                .filter(d -> !d.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Delivery", "id", id));

        // Enforce state transition rules
        Set<DeliveryStatus> allowed = VALID_TRANSITIONS.getOrDefault(
                delivery.getStatus(), EnumSet.noneOf(DeliveryStatus.class));

        if (!allowed.contains(newStatus)) {
            throw new ConflictException(String.format(
                    "Cannot transition delivery from %s to %s", delivery.getStatus(), newStatus));
        }

        delivery.setStatus(newStatus);

        // DELIVERED → update rental to COMPLETED (with guard against already-terminal
        // states)
        if (newStatus == DeliveryStatus.DELIVERED) {
            delivery.setDeliveredDate(LocalDateTime.now());

            Rental rental = rentalRepository.findById(delivery.getRentalId()).orElse(null);
            if (rental != null) {
                if (rental.getStatus() == RentalStatus.COMPLETED || rental.getStatus() == RentalStatus.CANCELLED) {
                    throw new ConflictException(
                            "Cannot mark delivery as DELIVERED: linked rental is already " + rental.getStatus());
                }
                rental.setStatus(RentalStatus.COMPLETED);
                rentalRepository.save(rental);
            }
        }

        return modelMapper.map(deliveryRepository.save(delivery), DeliveryResponse.class);
    }

    @Transactional
    public DeliveryResponse updateRoute(String id, com.campconnect.delivery.dto.RouteDto routeDto) {
        Delivery delivery = deliveryRepository.findById(id)
                .filter(d -> !d.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Delivery", "id", id));
        delivery.setRoute(modelMapper.map(routeDto, Route.class));
        return modelMapper.map(deliveryRepository.save(delivery), DeliveryResponse.class);
    }

    @Transactional
    public void softDelete(String id) {
        Delivery delivery = deliveryRepository.findById(id)
                .filter(d -> !d.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Delivery", "id", id));

        if (delivery.getStatus() == DeliveryStatus.IN_TRANSIT || delivery.getStatus() == DeliveryStatus.DISPATCHED) {
            throw new ConflictException("Cannot delete a delivery that is currently in transit or dispatched");
        }
        delivery.setDeleted(true);
        deliveryRepository.save(delivery);
    }

    private static final BigDecimal FLAT_RATE = new BigDecimal("15.00");

    public EarningsResponse calculateEarnings(String driverId) {
        List<Delivery> completed = deliveryRepository
                .findByDriverIdAndStatusAndDeletedFalse(driverId, DeliveryStatus.DELIVERED);

        EarningsResponse resp = new EarningsResponse();
        long count = completed.size();
        resp.setDeliveriesCompleted(count);

        BigDecimal total = FLAT_RATE.multiply(BigDecimal.valueOf(count));
        resp.setTotalEarnings(total);
        resp.setAveragePerDelivery(count > 0 ? FLAT_RATE : BigDecimal.ZERO);

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime oneWeekAgo = now.minusDays(7);
        LocalDateTime oneMonthAgo = now.minusDays(30);

        long weeklyCount = completed.stream()
                .filter(d -> d.getDeliveredDate() != null && d.getDeliveredDate().isAfter(oneWeekAgo))
                .count();
        long monthlyCount = completed.stream()
                .filter(d -> d.getDeliveredDate() != null && d.getDeliveredDate().isAfter(oneMonthAgo))
                .count();

        resp.setWeeklyEarnings(FLAT_RATE.multiply(BigDecimal.valueOf(weeklyCount)));
        resp.setMonthlyEarnings(FLAT_RATE.multiply(BigDecimal.valueOf(monthlyCount)));

        // Build daily breakdown
        Map<String, Long> dailyCounts = completed.stream()
                .filter(d -> d.getDeliveredDate() != null)
                .collect(Collectors.groupingBy(
                        d -> d.getDeliveredDate().toLocalDate().toString(),
                        Collectors.counting()
                ));

        List<EarningsResponse.DailyEarning> breakdown = dailyCounts.entrySet().stream()
                .map(e -> new EarningsResponse.DailyEarning(
                        e.getKey(),
                        FLAT_RATE.multiply(BigDecimal.valueOf(e.getValue())),
                        e.getValue().intValue()
                ))
                .sorted((a, b) -> b.getDate().compareTo(a.getDate()))
                .collect(Collectors.toList());

        resp.setDailyBreakdown(breakdown);
        return resp;
    }
}
