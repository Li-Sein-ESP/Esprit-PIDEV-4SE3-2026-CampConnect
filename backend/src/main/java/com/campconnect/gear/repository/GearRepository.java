package com.campconnect.gear.repository;

import com.campconnect.gear.model.Gear;
import com.campconnect.gear.model.GearStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;

@Repository
public interface GearRepository extends MongoRepository<Gear, String> {

    Page<Gear> findByDeletedFalse(Pageable pageable);

    Page<Gear> findByStatusAndDeletedFalse(GearStatus status, Pageable pageable);

    Page<Gear> findByCategoryAndDeletedFalse(String category, Pageable pageable);

    Page<Gear> findByOwnerIdAndDeletedFalse(String ownerId, Pageable pageable);

    Page<Gear> findByOwnerIdAndStatusAndDeletedFalse(String ownerId, GearStatus status, Pageable pageable);

    Page<Gear> findByStatusAndCategoryAndDeletedFalse(GearStatus status, String category, Pageable pageable);

    Page<Gear> findByPriceBetweenAndDeletedFalse(BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable);
}
