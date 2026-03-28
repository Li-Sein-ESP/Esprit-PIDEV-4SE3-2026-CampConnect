package com.campconnect.trip.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.campconnect.trip.entity.RouteOptimization;
import java.util.Optional;

public interface RouteOptimizationRepository extends MongoRepository<RouteOptimization, String> {
    Optional<RouteOptimization> findByTripId(String tripId);
}
