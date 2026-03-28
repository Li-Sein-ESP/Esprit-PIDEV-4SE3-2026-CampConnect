package com.campconnect.trip.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.campconnect.trip.entity.Activity;
import java.util.List;

public interface ActivityRepository extends MongoRepository<Activity, String> {
    List<Activity> findByItineraryId(String itineraryId);
}
