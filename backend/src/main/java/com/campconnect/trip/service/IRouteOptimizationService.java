package com.campconnect.trip.service;

import com.campconnect.trip.dto.RouteOptimizationDTO;
import com.campconnect.trip.entity.RouteOptimization;
import java.util.List;

public interface IRouteOptimizationService {
    List<RouteOptimization> findAll();

    RouteOptimization findById(String id);

    RouteOptimization save(RouteOptimizationDTO dto);

    RouteOptimization update(String id, RouteOptimizationDTO dto);

    void delete(String id);

    RouteOptimization findByTripId(String tripId);

    void assignToTrip(String optimizationId, String tripId);
}
