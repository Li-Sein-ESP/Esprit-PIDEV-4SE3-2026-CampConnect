package com.campconnect.gear.repository;

import com.campconnect.gear.model.Rental;
import com.campconnect.gear.model.RentalStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RentalRepository extends MongoRepository<Rental, String> {

    Page<Rental> findByGearId(String gearId, Pageable pageable);

    Page<Rental> findByRenterId(String renterId, Pageable pageable);

    List<Rental> findByRenterId(String renterId);

    Page<Rental> findByStatus(RentalStatus status, Pageable pageable);

    Page<Rental> findByGearIdAndStatus(String gearId, RentalStatus status, Pageable pageable);

    List<Rental> findByGearIdAndStatusIn(String gearId, List<RentalStatus> statuses);

    // Range queries using indexed fields
    Page<Rental> findByStartDateBetween(LocalDate from, LocalDate to, Pageable pageable);

    Page<Rental> findByEndDateBetween(LocalDate from, LocalDate to, Pageable pageable);

    long countByGearId(String gearId);
    long countByGearIdAndStatusIn(String gearId, java.util.List<RentalStatus> statuses);
    long countByGearIdInAndStatus(java.util.List<String> gearIds, RentalStatus status);

    @org.springframework.data.mongodb.repository.Query(value = "{ 'renterId': ?0, 'status': 'COMPLETED' }", fields = "{ 'totalPrice': 1 }")
    List<Rental> findCompletedRentalsByRenterId(String renterId);

    /**
     * Returns all non-cancelled rentals for a gear item.
     * Used by GET /api/gear/{gearId}/booked-dates.
     */
    @org.springframework.data.mongodb.repository.Query(
            "{ 'gearId': ?0, 'status': { $ne: 'CANCELLED' } }"
    )
    List<Rental> findBookedRentalsByGearId(String gearId);
}
