package com.campconnect.delivery.repository;

import com.campconnect.delivery.model.ProofOfDelivery;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface ProofOfDeliveryRepository extends MongoRepository<ProofOfDelivery, String> {
    Optional<ProofOfDelivery> findByDeliveryId(String deliveryId);
    boolean existsByDeliveryId(String deliveryId);
}
