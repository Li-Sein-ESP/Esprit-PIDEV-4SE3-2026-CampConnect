package com.campconnect.trip.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.campconnect.trip.entity.TripItinerary;
import java.util.List;

public interface TripItineraryRepository extends MongoRepository<TripItinerary, String> {
    List<TripItinerary> findByTripId(String tripId);
}
