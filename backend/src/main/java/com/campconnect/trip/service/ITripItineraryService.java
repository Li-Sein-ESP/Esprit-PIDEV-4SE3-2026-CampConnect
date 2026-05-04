package com.campconnect.trip.service;

import com.campconnect.trip.dto.TripItineraryDTO;
import com.campconnect.trip.entity.TripItinerary;
import java.util.List;

public interface ITripItineraryService {
    List<TripItinerary> findAll();

    TripItinerary findById(String id);

    TripItinerary save(TripItineraryDTO dto);

    TripItinerary update(String id, TripItineraryDTO dto);

    void delete(String id);

    List<TripItinerary> findByTripId(String tripId);

    void addActivityToItinerary(String itineraryId, String activityId);

    void addPoiToItinerary(String itineraryId, String poiId);

    void addSegmentToItinerary(String itineraryId, String segmentId);
}
