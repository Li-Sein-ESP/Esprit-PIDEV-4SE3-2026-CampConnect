package com.campconnect.delivery.repository;

import com.campconnect.delivery.model.Warehouse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WarehouseRepository extends MongoRepository<Warehouse, String> {
    List<Warehouse> findByProviderIdAndDeletedFalse(String providerId);

    Page<Warehouse> findByDeletedFalse(Pageable pageable);

    boolean existsByProviderIdAndDeletedFalse(String providerId);
}
