package com.campconnect.delivery.repository;

import com.campconnect.delivery.model.Vehicle;
import com.campconnect.delivery.model.VehicleStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends MongoRepository<Vehicle, String> {
    Optional<Vehicle> findByPlateNumberAndDeletedFalse(String plateNumber);

    boolean existsByPlateNumberAndDeletedFalse(String plateNumber);

    Page<Vehicle> findByStatusAndDeletedFalse(VehicleStatus status, Pageable pageable);

    List<Vehicle> findByStatusAndDeletedFalse(VehicleStatus status);

    List<Vehicle> findByDriverIdAndDeletedFalse(String driverId);

    Page<Vehicle> findByDeletedFalse(Pageable pageable);

    List<Vehicle> findByProviderIdAndDeletedFalse(String providerId);
}
