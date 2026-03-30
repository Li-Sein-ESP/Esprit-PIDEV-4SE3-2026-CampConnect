package com.campconnect.trip.service;

import com.campconnect.trip.dto.PointOfInterestDTO;
import com.campconnect.trip.entity.PointOfInterest;
import java.util.List;

public interface IPointOfInterestService {
    List<PointOfInterest> findAll();

    PointOfInterest findById(String id);

    PointOfInterest save(PointOfInterestDTO dto);

    PointOfInterest update(String id, PointOfInterestDTO dto);

    void delete(String id);

    List<PointOfInterest> findByItineraryId(String itineraryId);

    void assignToItinerary(String poiId, String itineraryId);
}
