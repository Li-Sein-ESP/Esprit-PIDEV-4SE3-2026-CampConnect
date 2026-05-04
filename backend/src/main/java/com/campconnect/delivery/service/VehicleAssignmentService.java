package com.campconnect.delivery.service;

import com.campconnect.delivery.dto.DeliveryResponse;
import com.campconnect.delivery.dto.RouteResponse;
import com.campconnect.delivery.model.Delivery;
import com.campconnect.delivery.model.DeliveryStatus;
import com.campconnect.delivery.model.DeliveryType;
import com.campconnect.delivery.model.Vehicle;
import com.campconnect.delivery.model.VehicleStatus;
import com.campconnect.delivery.model.Warehouse;
import com.campconnect.delivery.repository.DeliveryRepository;
import com.campconnect.delivery.repository.VehicleRepository;
import com.campconnect.delivery.repository.WarehouseRepository;
import com.campconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VehicleAssignmentService {

    private final WarehouseRepository warehouseRepository;
    private final VehicleRepository vehicleRepository;
    private final DeliveryRepository deliveryRepository;
    private final UserRepository userRepository;
    private final RouteService routeService;
    private final SimpMessagingTemplate messagingTemplate;
    private final ModelMapper modelMapper;

    @Transactional
    public Delivery assignVehicle(Delivery delivery) {
        if (delivery.getWarehouseId() == null) {
            delivery.setStatus(DeliveryStatus.PENDING);
            return deliveryRepository.save(delivery);
        }

        Warehouse warehouse = warehouseRepository.findById(delivery.getWarehouseId()).orElse(null);
        if (warehouse == null || warehouse.isDeleted()) {
            delivery.setStatus(DeliveryStatus.PENDING);
            return deliveryRepository.save(delivery);
        }

        List<Vehicle> candidates = vehicleRepository.findByStatusAndDeletedFalse(VehicleStatus.AVAILABLE)
                .stream()
                .filter(v -> v.getCapacity() >= 10.0)
                .filter(v -> v.getLatitude() != null && v.getLongitude() != null)
                .toList();

        if (candidates.isEmpty()) {
            delivery.setStatus(DeliveryStatus.PENDING);
            return deliveryRepository.save(delivery);
        }

        Vehicle selected = candidates.stream()
                .min(Comparator.comparingDouble(v -> haversineDistance(
                        v.getLatitude(), v.getLongitude(),
                        warehouse.getLatitude(), warehouse.getLongitude())))
                .orElse(null);

        if (selected == null) {
            delivery.setStatus(DeliveryStatus.PENDING);
            return deliveryRepository.save(delivery);
        }

        delivery.setVehicleId(selected.getId());
        delivery.setDriverId(selected.getDriverId());
        if (selected.getDriverId() != null) {
            userRepository.findById(selected.getDriverId()).ifPresent(user -> delivery.setDriverName(user.getName()));
        }
        delivery.setStatus(DeliveryStatus.ASSIGNED);

        if (delivery.getCustomerLat() != null && delivery.getCustomerLng() != null
                && warehouse.getLatitude() != null && warehouse.getLongitude() != null) {
            RouteResponse routeResponse = routeService.estimateRoute(
                    warehouse.getLatitude(), warehouse.getLongitude(),
                    delivery.getCustomerLat(), delivery.getCustomerLng());
            delivery.setEstimatedDuration(routeResponse.getDurationMinutes());
        }

        selected.setStatus(VehicleStatus.IN_USE);
        vehicleRepository.save(selected);

        Delivery saved = deliveryRepository.save(delivery);
        DeliveryResponse response = modelMapper.map(saved, DeliveryResponse.class);
        messagingTemplate.convertAndSend("/topic/delivery-updates", response);
        return saved;
    }

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void retryPendingAssignments() {
        List<Delivery> pendingExpress = deliveryRepository.findByStatusAndTypeAndDeletedFalse(
                DeliveryStatus.PENDING, DeliveryType.EXPRESS);
        for (Delivery delivery : pendingExpress) {
            assignVehicle(delivery);
        }
    }

    public double haversineDistance(double lat1, double lng1, double lat2, double lng2) {
        final double R = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
