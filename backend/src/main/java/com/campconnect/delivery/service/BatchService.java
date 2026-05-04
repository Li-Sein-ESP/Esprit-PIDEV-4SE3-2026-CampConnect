package com.campconnect.delivery.service;

import com.campconnect.delivery.dto.DeliveryResponse;
import com.campconnect.delivery.model.BatchStatus;
import com.campconnect.delivery.model.Delivery;
import com.campconnect.delivery.model.DeliveryBatch;
import com.campconnect.delivery.model.DeliveryStatus;
import com.campconnect.delivery.model.Vehicle;
import com.campconnect.delivery.model.VehicleStatus;
import com.campconnect.delivery.model.Warehouse;
import com.campconnect.delivery.repository.DeliveryBatchRepository;
import com.campconnect.delivery.repository.DeliveryRepository;
import com.campconnect.delivery.repository.VehicleRepository;
import com.campconnect.delivery.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BatchService {

    private static final long MAX_WAIT_HOURS = 24;
    private static final double FLAT_ITEM_WEIGHT = 10.0;

    private final DeliveryBatchRepository batchRepository;
    private final DeliveryRepository deliveryRepository;
    private final WarehouseRepository warehouseRepository;
    private final VehicleRepository vehicleRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ModelMapper modelMapper;

    @Transactional
    public void addToBatch(Delivery delivery) {
        Warehouse warehouse = delivery.getWarehouseId() != null
                ? warehouseRepository.findById(delivery.getWarehouseId()).orElse(null)
                : null;
        String providerId = warehouse != null ? warehouse.getProviderId() : "unknown-provider";
        String zone = zoneFrom(delivery.getCustomerLat(), delivery.getCustomerLng());

        DeliveryBatch batch = batchRepository.findByProviderIdAndZoneAndStatus(providerId, zone, BatchStatus.COLLECTING)
                .orElseGet(() -> {
                    DeliveryBatch created = new DeliveryBatch();
                    created.setProviderId(providerId);
                    created.setZone(zone);
                    created.setStatus(BatchStatus.COLLECTING);
                    return batchRepository.save(created);
                });

        if (!batch.getDeliveryIds().contains(delivery.getId())) {
            batch.getDeliveryIds().add(delivery.getId());
        }
        batch.setTotalCapacityUsed(batch.getTotalCapacityUsed() + FLAT_ITEM_WEIGHT);
        batch = batchRepository.save(batch);

        delivery.setBatchId(batch.getId());
        deliveryRepository.save(delivery);

        checkBatchDispatchConditions(batch);
    }

    @Transactional
    public void checkBatchDispatchConditions(DeliveryBatch batch) {
        double largestAvailableCapacity = vehicleRepository.findByStatusAndDeletedFalse(VehicleStatus.AVAILABLE)
                .stream()
                .map(Vehicle::getCapacity)
                .max(Double::compareTo)
                .orElse(0.0);

        boolean capacityReached = largestAvailableCapacity > 0 && batch.getTotalCapacityUsed() >= largestAvailableCapacity;
        boolean stale = batch.getCreatedAt() != null
                && Duration.between(batch.getCreatedAt(), LocalDateTime.now()).toHours() >= MAX_WAIT_HOURS;

        if (capacityReached || stale) {
            dispatchBatch(batch);
        }
    }

    @Transactional
    public void dispatchBatch(DeliveryBatch batch) {
        if (batch.getStatus() != BatchStatus.COLLECTING) {
            return;
        }

        Vehicle selected = vehicleRepository.findByStatusAndDeletedFalse(VehicleStatus.AVAILABLE)
                .stream()
                .filter(v -> v.getCapacity() >= batch.getTotalCapacityUsed())
                .max(Comparator.comparingDouble(Vehicle::getCapacity))
                .orElse(null);

        if (selected == null) {
            return;
        }

        batch.setStatus(BatchStatus.DISPATCHED);
        batch.setVehicleId(selected.getId());
        batchRepository.save(batch);

        selected.setStatus(VehicleStatus.IN_USE);
        vehicleRepository.save(selected);

        for (String deliveryId : batch.getDeliveryIds()) {
            deliveryRepository.findById(deliveryId)
                    .filter(d -> !d.isDeleted())
                    .ifPresent(delivery -> {
                        delivery.setVehicleId(selected.getId());
                        delivery.setDriverId(selected.getDriverId());
                        delivery.setStatus(DeliveryStatus.ASSIGNED);
                        Delivery saved = deliveryRepository.save(delivery);
                        DeliveryResponse response = modelMapper.map(saved, DeliveryResponse.class);
                        messagingTemplate.convertAndSend("/topic/delivery-updates", response);
                    });
        }
    }

    @Scheduled(fixedRate = 300000)
    @Transactional
    public void checkStaleExistingBatches() {
        List<DeliveryBatch> collecting = batchRepository.findByStatus(BatchStatus.COLLECTING);
        for (DeliveryBatch batch : collecting) {
            checkBatchDispatchConditions(batch);
        }
    }

    private String zoneFrom(Double lat, Double lng) {
        if (lat == null || lng == null) {
            return "unknown_zone";
        }
        double roundedLat = Math.round(lat * 10.0) / 10.0;
        double roundedLng = Math.round(lng * 10.0) / 10.0;
        return roundedLat + "_" + roundedLng;
    }
}
