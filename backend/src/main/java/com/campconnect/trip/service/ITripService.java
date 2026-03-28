package com.campconnect.trip.service;

import com.campconnect.trip.dto.TripDTO;
import com.campconnect.trip.entity.Trip;
import java.util.List;

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
}
