package com.campconnect.gear.repository;

import com.campconnect.gear.model.GearInventory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GearInventoryRepository extends MongoRepository<GearInventory, String> {
    List<GearInventory> findByGearId(String gearId);

    List<GearInventory> findByWarehouseId(String warehouseId);

    Optional<GearInventory> findByGearIdAndWarehouseId(String gearId, String warehouseId);

    void deleteByGearId(String gearId);

    void deleteByWarehouseId(String warehouseId);
}
