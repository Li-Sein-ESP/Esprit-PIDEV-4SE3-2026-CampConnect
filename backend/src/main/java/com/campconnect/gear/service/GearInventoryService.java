package com.campconnect.gear.service;

import com.campconnect.delivery.model.Warehouse;
import com.campconnect.delivery.repository.WarehouseRepository;
import com.campconnect.exception.BadRequestException;
import com.campconnect.exception.ResourceNotFoundException;
import com.campconnect.gear.dto.GearInventoryRequest;
import com.campconnect.gear.dto.GearInventoryResponse;
import com.campconnect.gear.model.Gear;
import com.campconnect.gear.model.GearInventory;
import com.campconnect.gear.model.GearStatus;
import com.campconnect.gear.repository.GearInventoryRepository;
import com.campconnect.gear.repository.GearRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GearInventoryService {

    private final GearInventoryRepository gearInventoryRepository;
    private final GearRepository gearRepository;
    private final WarehouseRepository warehouseRepository;
    private final MongoTemplate mongoTemplate;

    @Transactional
    public GearInventoryResponse setInventory(GearInventoryRequest request) {
        GearInventory inventory = gearInventoryRepository
                .findByGearIdAndWarehouseId(request.getGearId(), request.getWarehouseId())
                .orElseGet(GearInventory::new);

        inventory.setGearId(request.getGearId());
        inventory.setWarehouseId(request.getWarehouseId());
        inventory.setQuantity(request.getQuantity());

        GearInventory saved = gearInventoryRepository.save(inventory);
        syncGearStatusWithInventory(request.getGearId());
        return toResponse(saved);
    }

    public List<GearInventoryResponse> getInventoryByGear(String gearId) {
        return gearInventoryRepository.findByGearId(gearId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<GearInventoryResponse> getInventoryByWarehouse(String warehouseId) {
        return gearInventoryRepository.findByWarehouseId(warehouseId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public int getTotalStock(String gearId) {
        return gearInventoryRepository.findByGearId(gearId)
                .stream()
                .mapToInt(GearInventory::getQuantity)
                .sum();
    }

    @Transactional
    public void reserveStock(String gearId, String warehouseId, int quantity) {
        Query query = new Query(Criteria.where("gearId").is(gearId)
                .and("warehouseId").is(warehouseId)
                .and("quantity").gte(quantity));
        Update update = new Update().inc("quantity", -quantity);

        GearInventory updated = mongoTemplate.findAndModify(query, update, GearInventory.class);
        if (updated == null) {
            throw new BadRequestException("Insufficient stock in selected warehouse.");
        }
        syncGearStatusWithInventory(gearId);
    }

    @Transactional
    public void releaseStock(String gearId, String warehouseId, int quantity) {
        Query query = new Query(Criteria.where("gearId").is(gearId)
                .and("warehouseId").is(warehouseId));
        Update update = new Update().inc("quantity", quantity);

        GearInventory updated = mongoTemplate.findAndModify(query, update, GearInventory.class);
        if (updated == null) {
            throw new ResourceNotFoundException("GearInventory", "gearId+warehouseId", gearId + ":" + warehouseId);
        }
        syncGearStatusWithInventory(gearId);
    }

    public Warehouse findNearestWarehouseWithStock(String gearId, int quantity, double customerLat, double customerLng) {
        List<GearInventory> inventories = gearInventoryRepository.findByGearId(gearId);

        Warehouse nearest = null;
        double minDistance = Double.MAX_VALUE;

        for (GearInventory inventory : inventories) {
            if (inventory.getQuantity() < quantity) {
                continue;
            }
            Warehouse warehouse = warehouseRepository.findById(inventory.getWarehouseId())
                    .filter(w -> !w.isDeleted())
                    .orElse(null);
            if (warehouse == null || warehouse.getLatitude() == null || warehouse.getLongitude() == null) {
                continue;
            }

            double distance = haversineDistance(customerLat, customerLng, warehouse.getLatitude(), warehouse.getLongitude());
            if (distance < minDistance) {
                minDistance = distance;
                nearest = warehouse;
            }
        }

        if (nearest == null) {
            throw new BadRequestException("No warehouse has enough stock for this item.");
        }
        return nearest;
    }

    public List<GearInventoryResponse> getAvailableWarehouses(String gearId, int quantity, double customerLat, double customerLng) {
        List<GearInventory> inventories = gearInventoryRepository.findByGearId(gearId);
        List<GearInventoryDistance> candidates = new ArrayList<>();

        for (GearInventory inventory : inventories) {
            if (inventory.getQuantity() < quantity) {
                continue;
            }
            Warehouse warehouse = warehouseRepository.findById(inventory.getWarehouseId())
                    .filter(w -> !w.isDeleted())
                    .orElse(null);
            if (warehouse == null || warehouse.getLatitude() == null || warehouse.getLongitude() == null) {
                continue;
            }

            double distance = haversineDistance(customerLat, customerLng, warehouse.getLatitude(), warehouse.getLongitude());
            candidates.add(new GearInventoryDistance(inventory, distance));
        }

        return candidates.stream()
                .sorted(Comparator.comparingDouble(GearInventoryDistance::distance))
                .map(GearInventoryDistance::inventory)
                .map(this::toResponse)
                .toList();
    }

    private GearInventoryResponse toResponse(GearInventory inventory) {
        GearInventoryResponse response = new GearInventoryResponse();
        response.setId(inventory.getId());
        response.setGearId(inventory.getGearId());
        response.setWarehouseId(inventory.getWarehouseId());
        response.setQuantity(inventory.getQuantity());

        Gear gear = gearRepository.findById(inventory.getGearId()).orElse(null);
        if (gear != null) {
            response.setGearName(gear.getName());
        }
        Warehouse warehouse = warehouseRepository.findById(inventory.getWarehouseId()).orElse(null);
        if (warehouse != null) {
            response.setWarehouseName(warehouse.getName());
        }

        return response;
    }

    private void syncGearStatusWithInventory(String gearId) {
        Gear gear = gearRepository.findById(gearId).orElse(null);
        if (gear == null) {
            return;
        }

        int totalStock = getTotalStock(gearId);

        if (gear.getStatus() == GearStatus.MAINTENANCE) {
            return;
        }

        if (totalStock <= 0 && gear.getStatus() != GearStatus.OUT_OF_STOCK) {
            gear.setStatus(GearStatus.OUT_OF_STOCK);
            gearRepository.save(gear);
        } else if (totalStock > 0 && gear.getStatus() == GearStatus.OUT_OF_STOCK) {
            gear.setStatus(GearStatus.AVAILABLE);
            gearRepository.save(gear);
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

    private record GearInventoryDistance(GearInventory inventory, double distance) {
    }
}
