package com.campconnect.trip.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.campconnect.trip.entity.Trip;
import java.util.List;

public interface TripRepository extends MongoRepository<Trip, String> {
    List<Trip> findByUserId(String userId);

    List<Trip> findByTemplate(boolean template);
}
