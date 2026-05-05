package com.campconnect.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.campconnect.model.Reservation;
import com.campconnect.model.ReservationStatus;

@Repository
public interface ReservationRepository extends MongoRepository<Reservation, String> {
    List<Reservation> findByUserId(String userId);
    List<Reservation> findByTargetId(String targetId);
    long countByUserIdAndStatus(String userId, ReservationStatus status);
}
