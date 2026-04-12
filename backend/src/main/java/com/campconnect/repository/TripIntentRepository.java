package com.campconnect.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.campconnect.model.TripIntent;
import com.campconnect.model.TripIntentStatus;

@Repository
public interface TripIntentRepository extends MongoRepository<TripIntent, String> {
    List<TripIntent> findByCreatorUserId(String creatorUserId);

    List<TripIntent> findByStatus(TripIntentStatus status);
}
