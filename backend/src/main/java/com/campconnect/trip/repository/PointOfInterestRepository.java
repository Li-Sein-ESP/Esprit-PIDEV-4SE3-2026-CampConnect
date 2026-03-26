package com.campconnect.trip.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.campconnect.trip.entity.PointOfInterest;
import java.util.List;

public interface PointOfInterestRepository extends MongoRepository<PointOfInterest, String> {
    List<PointOfInterest> findByItineraryId(String itineraryId);
}
