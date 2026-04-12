package com.campconnect.gear.repository;

import com.campconnect.gear.model.Purchase;
import com.campconnect.gear.model.PurchaseStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PurchaseRepository extends MongoRepository<Purchase, String> {

    Page<Purchase> findByBuyerId(String buyerId, Pageable pageable);

    Page<Purchase> findByGearId(String gearId, Pageable pageable);

    Page<Purchase> findByStatus(PurchaseStatus status, Pageable pageable);

    long countByGearId(String gearId);
    java.util.List<Purchase> findByGearIdIn(java.util.List<String> gearIds);
}
