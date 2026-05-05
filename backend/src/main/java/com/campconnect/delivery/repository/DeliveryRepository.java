package com.campconnect.delivery.repository;

import com.campconnect.delivery.model.Delivery;
import com.campconnect.delivery.model.DeliveryPriority;
import com.campconnect.delivery.model.DeliveryStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Collection;

@Repository
public interface DeliveryRepository extends MongoRepository<Delivery, String> {

    Page<Delivery> findByDeletedFalse(Pageable pageable);

    Page<Delivery> findByDriverIdAndDeletedFalse(String driverId, Pageable pageable);

    Page<Delivery> findByRentalIdAndDeletedFalse(String rentalId, Pageable pageable);

    Page<Delivery> findByStatusAndDeletedFalse(DeliveryStatus status, Pageable pageable);

    Page<Delivery> findByPriorityAndDeletedFalse(DeliveryPriority priority, Pageable pageable);

    Page<Delivery> findByScheduledDateBetweenAndDeletedFalse(LocalDate from, LocalDate to, Pageable pageable);

    boolean existsByRentalIdAndStatusAndDeletedFalse(String rentalId, DeliveryStatus status);

    java.util.List<Delivery> findByDriverIdAndStatusAndDeletedFalse(String driverId, DeliveryStatus status);

    java.util.List<Delivery> findByDriverIdAndDeletedFalse(String driverId);
    
    // Optimized count queries for driver stats
    long countByDriverIdAndDeletedFalse(String driverId);
    
    long countByDriverIdAndStatusAndDeletedFalse(String driverId, DeliveryStatus status);
    
    long countByDriverIdAndStatusInAndDeletedFalse(String driverId, Collection<DeliveryStatus> statuses);
}
