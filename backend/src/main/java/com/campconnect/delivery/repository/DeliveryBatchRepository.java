package com.campconnect.delivery.repository;

import com.campconnect.delivery.model.BatchStatus;
import com.campconnect.delivery.model.DeliveryBatch;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryBatchRepository extends MongoRepository<DeliveryBatch, String> {
    Optional<DeliveryBatch> findByProviderIdAndZoneAndStatus(String providerId, String zone, BatchStatus status);

    List<DeliveryBatch> findByProviderIdAndStatus(String providerId, BatchStatus status);

    List<DeliveryBatch> findByStatus(BatchStatus status);
}
