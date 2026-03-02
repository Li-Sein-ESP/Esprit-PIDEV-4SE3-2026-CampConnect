package com.campconnect.delivery.service;

import com.campconnect.common.PagedResponse;
import com.campconnect.delivery.dto.DeliveryRequest;
import com.campconnect.delivery.dto.DeliveryResponse;
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
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class DeliveryService {

    private final DeliveryRepository deliveryRepository;
    private final RentalRepository rentalRepository;
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
        // 1. Validate rental exists and is APPROVED
        Rental rental = rentalRepository.findById(request.getRentalId())
                .orElseThrow(() -> new ResourceNotFoundException("Rental", "id", request.getRentalId()));

        if (rental.getStatus() != RentalStatus.APPROVED) {
            throw new BadRequestException(
                    "Delivery can only be created for APPROVED rentals. Current status: " + rental.getStatus());
        }

        if (request.getScheduledDate().isBefore(rental.getStartDate())
                || request.getScheduledDate().isAfter(rental.getEndDate())) {
            throw new BadRequestException("Scheduled date must be within the rental period");
        }

        // 2. Prevent duplicate active delivery for same rental
        if (deliveryRepository.existsByRentalIdAndStatusAndDeletedFalse(request.getRentalId(), DeliveryStatus.CREATED)
                ||
                deliveryRepository.existsByRentalIdAndStatusAndDeletedFalse(request.getRentalId(),
                        DeliveryStatus.DISPATCHED)
                ||
                deliveryRepository.existsByRentalIdAndStatusAndDeletedFalse(request.getRentalId(),
                        DeliveryStatus.IN_TRANSIT)) {
            throw new ConflictException("An active delivery already exists for this rental");
        }

        // 3. Validate driver has ROLE_DELIVERY_PROVIDER
        User driver = userRepository.findById(request.getDriverId())
                .orElseThrow(() -> new ResourceNotFoundException("Driver", "id", request.getDriverId()));

        boolean isDriver = driver.getRoles().stream()
                .anyMatch(role -> role.getName() == ERole.ROLE_DELIVERY_PROVIDER);
        if (!isDriver) {
            throw new BadRequestException("Assigned user does not have the DELIVERY_PROVIDER role");
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
}
