package com.campconnect.repository;

import com.campconnect.model.Trip;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripRepository extends MongoRepository<Trip, String> {
    List<Trip> findByCreatorId(String creatorId);
    List<Trip> findByStatus(String status);
}
