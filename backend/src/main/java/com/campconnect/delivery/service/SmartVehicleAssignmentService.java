package com.campconnect.delivery.service;

import com.campconnect.delivery.dto.DeliveryResponse;
import com.campconnect.delivery.model.Delivery;
import com.campconnect.delivery.model.DeliveryStatus;
import com.campconnect.delivery.model.Vehicle;
import com.campconnect.delivery.model.VehicleSchedule;
import com.campconnect.delivery.model.VehicleStatus;
import com.campconnect.delivery.model.Warehouse;
import com.campconnect.delivery.repository.DeliveryRepository;
import com.campconnect.delivery.repository.VehicleRepository;
import com.campconnect.delivery.repository.VehicleScheduleRepository;
import com.campconnect.delivery.repository.WarehouseRepository;
import com.campconnect.exception.BadRequestException;
import com.campconnect.exception.ConflictException;
import com.campconnect.exception.ResourceNotFoundException;
import com.campconnect.model.User;
import com.campconnect.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
public class SmartVehicleAssignmentService {

    private final VehicleRepository vehicleRepository;
    private final VehicleScheduleRepository scheduleRepository;
    private final DeliveryRepository deliveryRepository;
    private final WarehouseRepository warehouseRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ModelMapper modelMapper;

    @Value("${delivery.default.provider.email:delivery@mail.com}")
    private String defaultProviderEmail;

    public SmartVehicleAssignmentService(
            VehicleRepository vehicleRepository,
            VehicleScheduleRepository scheduleRepository,
            DeliveryRepository deliveryRepository,
            WarehouseRepository warehouseRepository,
            UserRepository userRepository,
            SimpMessagingTemplate messagingTemplate,
            ModelMapper modelMapper) {
        this.vehicleRepository = vehicleRepository;
        this.scheduleRepository = scheduleRepository;
        this.deliveryRepository = deliveryRepository;
        this.warehouseRepository = warehouseRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
        this.modelMapper = modelMapper;
    }

    /**
     * Assigns the best available vehicle to a delivery using a multi-tier strategy:
     *   1. Zone-based scoring (ideal match)
     *   2. Same-provider vehicles ignoring zones (fallback #1)
     *   3. Any available vehicle system-wide (fallback #2)
     *   4. Direct driver assignment to default delivery provider (last resort)
     * Only marks PENDING if no assignment can be made at any tier.
     */
    @Transactional
    public Delivery assignVehicle(Delivery delivery) {
        LocalDate targetDate = delivery.getScheduledDate() != null
                ? delivery.getScheduledDate()
                : LocalDate.now();

        double requiredWeight = delivery.getGearWeightKg();

        // 1. Resolve zone and providerId from warehouse
        String zone = resolveZone(delivery.getWarehouseId());
        String providerId = resolveProviderId(delivery.getWarehouseId());

        log.info("[Assign] deliveryId={} warehouseId={} zone={} providerId={} weight={}kg date={}",
                delivery.getId(), delivery.getWarehouseId(), zone, providerId, requiredWeight, targetDate);

        // --- Tier 1: Zone-based scoring (original logic) ---
        if (zone != null && !zone.isBlank() && providerId != null && !providerId.isBlank()) {
            List<Vehicle> providerVehicles = vehicleRepository.findByProviderIdAndDeletedFalse(providerId);
            log.info("[Tier1] provider {} has {} vehicles total", providerId, providerVehicles.size());

            List<Vehicle> eligible = providerVehicles.stream()
                    .filter(v -> v.getStatus() == VehicleStatus.AVAILABLE)
                    .filter(v -> v.getCoverageZones() != null && v.getCoverageZones().contains(zone))
                    .filter(v -> v.getMaxCapacityKg() > 0)
                    .toList();
            log.info("[Tier1] {} eligible vehicles after AVAILABLE+zone+capacity filter", eligible.size());

            Vehicle best = pickBestVehicle(eligible, requiredWeight, targetDate, providerId, zone);
            if (best != null) {
                log.info("[Tier1-ZoneBased] Assigned vehicle {} to delivery {}", best.getId(), delivery.getId());
                return commitAssignment(delivery, best, targetDate, zone, providerId);
            }
            log.info("Tier1 (zone-based) found no vehicle for delivery {} — trying Tier2", delivery.getId());
        } else {
            log.info("[Tier1] Skipped — zone={} providerId={}", zone, providerId);
        }

        // --- Tier 2: Same-provider vehicles, ignoring zone filter ---
        if (providerId != null && !providerId.isBlank()) {
            List<Vehicle> providerVehicles = vehicleRepository.findByProviderIdAndDeletedFalse(providerId);

            List<Vehicle> available = providerVehicles.stream()
                    .filter(v -> v.getStatus() == VehicleStatus.AVAILABLE)
                    .filter(v -> v.getMaxCapacityKg() > 0)
                    .toList();
            log.info("[Tier2] {} available vehicles for provider {} (ignoring zone)", available.size(), providerId);

            Vehicle best = pickBestVehicle(available, requiredWeight, targetDate, providerId, zone);
            if (best != null) {
                log.info("[Tier2-ProviderAny] Assigned vehicle {} to delivery {}", best.getId(), delivery.getId());
                return commitAssignment(delivery, best, targetDate, zone, providerId);
            }
            log.info("Tier2 (provider-any) found no vehicle for delivery {} — trying Tier3", delivery.getId());
        }

        // --- Tier 3: Any available vehicle system-wide ---
        List<Vehicle> allAvailable = vehicleRepository.findByStatusAndDeletedFalse(VehicleStatus.AVAILABLE)
                .stream()
                .filter(v -> v.getMaxCapacityKg() > 0)
                .toList();
        log.info("[Tier3] {} available vehicles system-wide", allAvailable.size());

        Vehicle best = pickBestVehicle(allAvailable, requiredWeight, targetDate,
                providerId != null ? providerId : "system", zone);
        if (best != null) {
            log.info("[Tier3-SystemWide] Assigned vehicle {} to delivery {}", best.getId(), delivery.getId());
            return commitAssignment(delivery, best, targetDate, zone,
                    best.getProviderId() != null ? best.getProviderId() : providerId);
        }

        // --- Tier 4: Direct driver assignment to the default delivery provider ---
        log.info("Tier3 found no vehicle — trying Tier4 (direct provider assignment) for delivery {}", delivery.getId());
        Optional<User> defaultProvider = userRepository.findByEmail(defaultProviderEmail);
        if (defaultProvider.isPresent()) {
            User driver = defaultProvider.get();

            // Try to find any vehicle owned by this provider
            List<Vehicle> driverVehicles = vehicleRepository.findByProviderIdAndDeletedFalse(driver.getId());
            log.info("[Tier4] Default provider {} ({}) has {} vehicles",
                    driver.getName(), driver.getId(), driverVehicles.size());
            String vehicleId = driverVehicles.isEmpty() ? null : driverVehicles.get(0).getId();

            delivery.setDriverId(driver.getId());
            delivery.setDriverName(driver.getName());
            delivery.setVehicleId(vehicleId);
            delivery.setStatus(DeliveryStatus.ASSIGNED);
            Delivery saved = deliveryRepository.save(delivery);

            DeliveryResponse response = mapToResponse(saved);
            messagingTemplate.convertAndSend("/topic/delivery-updates", response);
            messagingTemplate.convertAndSend("/topic/delivery-notifications", response);

            log.info("[Tier4-DirectProvider] Assigned delivery {} to default provider {} ({})",
                    saved.getId(), driver.getName(), defaultProviderEmail);
            return saved;
        }

        // --- No assignment possible at any tier ---
        log.warn("No vehicle or default provider available for delivery {} — marking PENDING", delivery.getId());
        return markPendingAndAlert(delivery, "No available vehicle or provider found.");
    }

    /**
     * Picks the best vehicle from a candidate list based on capacity and scheduling.
     * Returns null if no vehicle qualifies.
     */
    private Vehicle pickBestVehicle(List<Vehicle> candidates, double requiredWeight,
                                     LocalDate targetDate, String providerId, String zone) {
        if (candidates.isEmpty()) return null;

        Map<String, VehicleSchedule> schedules = new HashMap<>();
        for (Vehicle v : candidates) {
            String pid = v.getProviderId() != null ? v.getProviderId() : providerId;
            VehicleSchedule sched = scheduleRepository
                    .findByVehicleIdAndDate(v.getId(), targetDate)
                    .orElseGet(() -> buildEmptySchedule(v.getId(), pid, targetDate));
            schedules.put(v.getId(), sched);
        }

        List<Vehicle> qualified = candidates.stream()
                .filter(v -> {
                    VehicleSchedule s = schedules.get(v.getId());
                    return (s.getUsedCapacityKg() + requiredWeight) <= v.getMaxCapacityKg();
                })
                .toList();

        if (qualified.isEmpty()) return null;

        String effectiveZone = zone != null ? zone : "";
        return qualified.stream()
                .max(Comparator.comparingInt(v -> score(v, schedules.get(v.getId()), effectiveZone)))
                .orElse(null);
    }

    /**
     * Commits a vehicle assignment: updates delivery, vehicle schedule, and broadcasts via WebSocket.
     */
    private Delivery commitAssignment(Delivery delivery, Vehicle vehicle,
                                       LocalDate targetDate, String zone, String providerId) {
        delivery.setVehicleId(vehicle.getId());
        delivery.setDriverId(vehicle.getDriverId());
        if (vehicle.getDriverId() != null) {
            userRepository.findById(vehicle.getDriverId())
                    .ifPresent(u -> delivery.setDriverName(u.getName()));
        }
        delivery.setStatus(DeliveryStatus.ASSIGNED);

        Delivery saved = deliveryRepository.save(delivery);

        // Update VehicleSchedule
        String pid = vehicle.getProviderId() != null ? vehicle.getProviderId() : providerId;
        VehicleSchedule schedule = scheduleRepository
                .findByVehicleIdAndDate(vehicle.getId(), targetDate)
                .orElseGet(() -> buildEmptySchedule(vehicle.getId(), pid, targetDate));
        schedule.setUsedCapacityKg(schedule.getUsedCapacityKg() + delivery.getGearWeightKg());
        schedule.setOrderCount(schedule.getOrderCount() + 1);
        if (schedule.getDeliveryIds() == null) schedule.setDeliveryIds(new ArrayList<>());
        schedule.getDeliveryIds().add(saved.getId());
        if (zone != null && !zone.isBlank()) {
            if (schedule.getZonesServed() == null) schedule.setZonesServed(new ArrayList<>());
            if (!schedule.getZonesServed().contains(zone)) {
                schedule.getZonesServed().add(zone);
            }
        }
        scheduleRepository.save(schedule);

        // Broadcast to provider dashboard
        DeliveryResponse response = mapToResponse(saved);
        messagingTemplate.convertAndSend("/topic/delivery-updates", response);

        return saved;
    }

    private DeliveryResponse mapToResponse(Delivery saved) {
        DeliveryResponse response = new DeliveryResponse();
        response.setId(saved.getId());
        response.setRentalId(saved.getRentalId());
        response.setPurchaseId(saved.getPurchaseId());
        response.setDriverId(saved.getDriverId());
        response.setDriverName(saved.getDriverName());
        response.setVehicleId(saved.getVehicleId());
        response.setPickupAddress(saved.getPickupAddress());
        response.setDeliveryAddress(saved.getDeliveryAddress());
        response.setCustomerLat(saved.getCustomerLat());
        response.setCustomerLng(saved.getCustomerLng());
        response.setScheduledDate(saved.getScheduledDate());
        response.setDeliveredDate(saved.getDeliveredDate());
        response.setStatus(saved.getStatus());
        response.setPriority(saved.getPriority());
        response.setType(saved.getType());
        response.setMethod(saved.getMethod());
        response.setWarehouseId(saved.getWarehouseId());
        return response;
    }

    /**
     * Manual provider override — reassign delivery to a specific vehicle.
     */
    @Transactional
    public DeliveryResponse reassign(String deliveryId, String newVehicleId, String requestingProviderId) {
        Delivery delivery = deliveryRepository.findById(deliveryId)
                .filter(d -> !d.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Delivery", "id", deliveryId));

        Vehicle newVehicle = vehicleRepository.findById(newVehicleId)
                .filter(v -> !v.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", newVehicleId));

        if (newVehicle.getProviderId() != null && !newVehicle.getProviderId().equals(requestingProviderId)) {
            throw new BadRequestException("Vehicle does not belong to your fleet.");
        }

        LocalDate targetDate = delivery.getScheduledDate() != null ? delivery.getScheduledDate() : LocalDate.now();
        VehicleSchedule newSchedule = scheduleRepository
                .findByVehicleIdAndDate(newVehicleId, targetDate)
                .orElseGet(() -> buildEmptySchedule(newVehicleId, requestingProviderId, targetDate));

        double required = delivery.getGearWeightKg();
        if (newSchedule.getUsedCapacityKg() + required > newVehicle.getMaxCapacityKg()) {
            throw new ConflictException("Vehicle " + newVehicleId + " has insufficient capacity for " + targetDate);
        }

        // Decrement old vehicle's schedule if any
        String oldVehicleId = delivery.getVehicleId();
        if (oldVehicleId != null && !oldVehicleId.equals(newVehicleId)) {
            scheduleRepository.findByVehicleIdAndDate(oldVehicleId, targetDate).ifPresent(oldSched -> {
                oldSched.setUsedCapacityKg(Math.max(0, oldSched.getUsedCapacityKg() - required));
                oldSched.setOrderCount(Math.max(0, oldSched.getOrderCount() - 1));
                if (oldSched.getDeliveryIds() != null) oldSched.getDeliveryIds().remove(deliveryId);
                scheduleRepository.save(oldSched);
            });
        }

        // Assign new vehicle
        delivery.setVehicleId(newVehicleId);
        delivery.setDriverId(newVehicle.getDriverId());
        if (newVehicle.getDriverId() != null) {
            userRepository.findById(newVehicle.getDriverId())
                    .ifPresent(u -> delivery.setDriverName(u.getName()));
        }
        delivery.setStatus(DeliveryStatus.ASSIGNED);
        Delivery saved = deliveryRepository.save(delivery);

        // Update new schedule
        newSchedule.setUsedCapacityKg(newSchedule.getUsedCapacityKg() + required);
        newSchedule.setOrderCount(newSchedule.getOrderCount() + 1);
        if (newSchedule.getDeliveryIds() == null) newSchedule.setDeliveryIds(new ArrayList<>());
        newSchedule.getDeliveryIds().add(deliveryId);
        scheduleRepository.save(newSchedule);

        DeliveryResponse response = mapToResponse(saved);
        messagingTemplate.convertAndSend("/topic/delivery-updates", response);
        return response;
    }

    /** Retry PENDING and CREATED deliveries every 60 seconds. */
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void retryPendingAssignments() {
        // Retry all PENDING deliveries regardless of type
        List<Delivery> pending = deliveryRepository.findByStatusInAndDeletedFalse(
                List.of(DeliveryStatus.PENDING, DeliveryStatus.CREATED));

        if (!pending.isEmpty()) {
            log.info("[RetryJob] Retrying {} PENDING/CREATED deliveries", pending.size());
        }

        for (Delivery d : pending) {
            try {
                assignVehicle(d);
            } catch (Exception e) {
                log.error("Retry assignment failed for delivery {}: {}", d.getId(), e.getMessage());
            }
        }
    }

    // ---------- Private helpers ----------

    private int score(Vehicle v, VehicleSchedule s, String zone) {
        int points = 0;
        if (s.getZonesServed() != null && s.getZonesServed().contains(zone)) {
            points += 10; // already serving this zone today
        }
        if (v.getMaxCapacityKg() > 0 && s.getUsedCapacityKg() / v.getMaxCapacityKg() < 0.50) {
            points += 5; // under 50% capacity
        }
        if (s.getOrderCount() == 0 && (s.getZonesServed() == null || !s.getZonesServed().contains(zone))) {
            points -= 5; // idle vehicle, new zone — penalise zone fragmentation
        }
        return points;
    }

    private Delivery markPendingAndAlert(Delivery delivery, String reason) {
        delivery.setStatus(DeliveryStatus.PENDING);
        Delivery saved = deliveryRepository.save(delivery);

        Map<String, Object> alert = new HashMap<>();
        alert.put("type", "UNASSIGNED");
        alert.put("deliveryId", delivery.getId());
        alert.put("reason", reason);
        alert.put("scheduledDate", delivery.getScheduledDate() != null ? delivery.getScheduledDate().toString() : null);
        alert.put("deliveryAddress", delivery.getDeliveryAddress());
        alert.put("warehouseId", delivery.getWarehouseId());

        // Push to the specific provider's topic (if resolved)
        String providerId = resolveProviderId(delivery.getWarehouseId());
        if (providerId != null) {
            messagingTemplate.convertAndSend("/topic/provider-alerts/" + providerId, alert);
        }

        // Also broadcast globally so ALL delivery providers can see unassigned deliveries
        messagingTemplate.convertAndSend("/topic/delivery-notifications", alert);

        // Broadcast the delivery state via the general update channel
        DeliveryResponse response = mapToResponse(saved);
        messagingTemplate.convertAndSend("/topic/delivery-updates", response);

        return saved;
    }

    private String resolveZone(String warehouseId) {
        if (warehouseId == null) return null;
        return warehouseRepository.findById(warehouseId)
                .filter(w -> !w.isDeleted())
                .map(Warehouse::getZone)
                .orElse(null);
    }

    private String resolveProviderId(String warehouseId) {
        if (warehouseId == null) return null;
        return warehouseRepository.findById(warehouseId)
                .filter(w -> !w.isDeleted())
                .map(Warehouse::getProviderId)
                .orElse(null);
    }

    private VehicleSchedule buildEmptySchedule(String vehicleId, String providerId, LocalDate date) {
        VehicleSchedule s = new VehicleSchedule();
        s.setVehicleId(vehicleId);
        s.setProviderId(providerId);
        s.setDate(date);
        return s;
    }
}
