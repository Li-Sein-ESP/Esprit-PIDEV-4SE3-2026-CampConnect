package com.campconnect.service;

import com.campconnect.dto.TripDTO;
import java.util.List;

public interface TripService {
    TripDTO createTrip(TripDTO tripDTO);
    TripDTO getTripById(String id);
    List<TripDTO> getAllTrips();
    void deleteTrip(String id);
    TripDTO updateTrip(String id, TripDTO tripDTO);
}
