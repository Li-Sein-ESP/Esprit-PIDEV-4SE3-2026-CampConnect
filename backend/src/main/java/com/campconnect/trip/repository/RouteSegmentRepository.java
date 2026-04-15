package com.campconnect.trip.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.campconnect.trip.entity.RouteSegment;
import java.util.List;

public interface RouteSegmentRepository extends MongoRepository<RouteSegment, String> {
    List<RouteSegment> findByItineraryId(String itineraryId);
}
