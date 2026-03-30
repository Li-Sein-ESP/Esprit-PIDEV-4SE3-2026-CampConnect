package com.campconnect.trip.service;

import com.campconnect.trip.dto.RouteSegmentDTO;
import com.campconnect.trip.entity.RouteSegment;
import java.util.List;

public interface IRouteSegmentService {
    List<RouteSegment> findAll();

    RouteSegment findById(String id);

    RouteSegment save(RouteSegmentDTO dto);

    RouteSegment update(String id, RouteSegmentDTO dto);

    void delete(String id);

    List<RouteSegment> findByItineraryId(String itineraryId);

    void assignToItinerary(String segmentId, String itineraryId);

    void addAlertToSegment(String segmentId, String alertId);
}
