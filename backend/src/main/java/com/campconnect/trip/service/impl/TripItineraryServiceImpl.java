package com.campconnect.trip.service.impl;

import com.campconnect.trip.dto.TripItineraryDTO;
import com.campconnect.trip.entity.TripItinerary;
import com.campconnect.trip.repository.TripItineraryRepository;
import com.campconnect.trip.service.ITripItineraryService;
import com.campconnect.trip.repository.ActivityRepository;
import com.campconnect.trip.repository.PointOfInterestRepository;
import com.campconnect.trip.repository.RouteSegmentRepository;
import com.campconnect.trip.entity.Activity;
import com.campconnect.trip.entity.PointOfInterest;
import com.campconnect.trip.entity.RouteSegment;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TripItineraryServiceImpl implements ITripItineraryService {
    private final TripItineraryRepository repository;
    private final ActivityRepository activityRepository;
    private final PointOfInterestRepository poiRepository;
    private final RouteSegmentRepository routeSegmentRepository;

    @Override
    public List<TripItinerary> findAll() {
        return repository.findAll();
    }

    @Override
    public TripItinerary findById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Itinerary not found"));
    }

    @Override
    public TripItinerary save(TripItineraryDTO dto) {
        TripItinerary entity = new TripItinerary();
        if (dto.getId() != null && !dto.getId().isEmpty()) {
            entity.setId(dto.getId());
        } else {
            entity.setId(UUID.randomUUID().toString());
        }
        mapDtoToEntity(dto, entity);
        return repository.save(entity);
    }

    @Override
    public TripItinerary update(String id, TripItineraryDTO dto) {
        TripItinerary entity = findById(id);
        mapDtoToEntity(dto, entity);
        return repository.save(entity);
    }

    @Override
    public void delete(String id) {
        if (!repository.existsById(id))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Itinerary not found");
        repository.deleteById(id);
    }

    @Override
    public List<TripItinerary> findByTripId(String tripId) {
        return repository.findByTripId(tripId);
    }

    @Override
    public void addActivityToItinerary(String itineraryId, String activityId) {
        TripItinerary itinerary = findById(itineraryId);
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Activity not found"));

        if (!itinerary.getActivityIds().contains(activityId)) {
            itinerary.getActivityIds().add(activityId);
            repository.save(itinerary);
        }

        if (activity.getItineraryId() == null || !activity.getItineraryId().equals(itineraryId)) {
            activity.setItineraryId(itineraryId);
            activityRepository.save(activity);
        }
    }

    @Override
    public void addPoiToItinerary(String itineraryId, String poiId) {
        TripItinerary itinerary = findById(itineraryId);
        PointOfInterest poi = poiRepository.findById(poiId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "POI not found"));

        if (!itinerary.getPoiIds().contains(poiId)) {
            itinerary.getPoiIds().add(poiId);
            repository.save(itinerary);
        }

        if (poi.getItineraryId() == null || !poi.getItineraryId().equals(itineraryId)) {
            poi.setItineraryId(itineraryId);
            poiRepository.save(poi);
        }
    }

    @Override
    public void addSegmentToItinerary(String itineraryId, String segmentId) {
        TripItinerary itinerary = findById(itineraryId);
        RouteSegment segment = routeSegmentRepository.findById(segmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Route Segment not found"));

        if (!itinerary.getRouteSegmentIds().contains(segmentId)) {
            itinerary.getRouteSegmentIds().add(segmentId);
            repository.save(itinerary);
        }

        if (segment.getItineraryId() == null || !segment.getItineraryId().equals(itineraryId)) {
            segment.setItineraryId(itineraryId);
            routeSegmentRepository.save(segment);
        }
    }

    private void mapDtoToEntity(TripItineraryDTO dto, TripItinerary entity) {
        if (dto.getTripId() != null)
            entity.setTripId(dto.getTripId());
        if (dto.getDayNumber() > 0)
            entity.setDayNumber(dto.getDayNumber());
        if (dto.getDailyDescription() != null)
            entity.setDailyDescription(dto.getDailyDescription());
        if (dto.getActivityIds() != null)
            entity.setActivityIds(dto.getActivityIds());
        if (dto.getPoiIds() != null)
            entity.setPoiIds(dto.getPoiIds());
        if (dto.getRouteSegmentIds() != null)
            entity.setRouteSegmentIds(dto.getRouteSegmentIds());
    }
}
