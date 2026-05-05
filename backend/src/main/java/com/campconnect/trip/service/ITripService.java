package com.campconnect.trip.service;

import com.campconnect.trip.dto.TripDTO;
import com.campconnect.trip.entity.Trip;
import java.util.List;
import java.util.Set;

public interface ITripService {
    List<Trip> findAll();

    Trip findById(String id);

    Trip save(TripDTO dto);

    Trip update(String id, TripDTO dto);

    void delete(String id);

    List<Trip> findByUserId(String userId);

    List<Trip> findTemplateTrips();

    void addTransportToTrip(String tripId, String transportId);

    void addItineraryToTrip(String tripId, String itineraryId);

    // 3. Complex Keyword Search
    List<Trip> searchByKeywords(String query);

    List<Trip> searchByCriteria(String difficulty, String address);

    // 2. Aggregation Analytics
    List<java.util.Map<String, Object>> getDifficultyStats();

    Set<String> getDatabaseCollections();
    
    Trip saveAiGeneratedItinerary(String tripId, com.campconnect.predict.dto.ItineraryOptionDto selectedProgram);
    
    List<com.campconnect.predict.dto.ItineraryDayDto> getFullItinerary(String tripId);
}
