package com.campconnect.delivery.repository;

import com.campconnect.delivery.model.VehicleSchedule;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleScheduleRepository extends MongoRepository<VehicleSchedule, String> {

    Optional<VehicleSchedule> findByVehicleIdAndDate(String vehicleId, LocalDate date);

    List<VehicleSchedule> findByVehicleIdAndDateBetween(String vehicleId, LocalDate from, LocalDate to);

    List<VehicleSchedule> findByProviderIdAndDateBetween(String providerId, LocalDate from, LocalDate to);

    /**
     * Atomic increment of usedCapacityKg and orderCount, with upsert.
     * Uses Spring Data MongoDB update — called from SmartVehicleAssignmentService.
     */
    @Query("{'vehicleId': ?0, 'date': ?1}")
    Optional<VehicleSchedule> findByVehicleIdAndDateExact(String vehicleId, LocalDate date);
}
