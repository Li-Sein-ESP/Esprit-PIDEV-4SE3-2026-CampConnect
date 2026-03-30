package com.campconnect.trip.service.impl;

import com.campconnect.trip.dto.RouteSegmentDTO;
import com.campconnect.trip.entity.RouteSegment;
import com.campconnect.trip.repository.RouteSegmentRepository;
import com.campconnect.trip.service.IRouteSegmentService;
import com.campconnect.trip.repository.TripItineraryRepository;
import com.campconnect.transport.repository.SafetyAlertRepository;
import com.campconnect.trip.entity.TripItinerary;
import com.campconnect.transport.entity.SafetyAlert;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RouteSegmentServiceImpl implements IRouteSegmentService {
    private final RouteSegmentRepository repository;
    private final TripItineraryRepository itineraryRepository;
    private final SafetyAlertRepository safetyAlertRepository;

    @Override
    public List<RouteSegment> findAll() {
        return repository.findAll();
    }

    @Override
    public RouteSegment findById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "RouteSegment not found"));
    }

    @Override
    public RouteSegment save(RouteSegmentDTO dto) {
        RouteSegment entity = new RouteSegment();
        if (dto.getId() != null && !dto.getId().isEmpty()) {
            entity.setId(dto.getId());
        } else {
            entity.setId(UUID.randomUUID().toString());
        }
        mapDtoToEntity(dto, entity);
        return repository.save(entity);
    }

    @Override
    public RouteSegment update(String id, RouteSegmentDTO dto) {
        RouteSegment entity = findById(id);
        mapDtoToEntity(dto, entity);
        return repository.save(entity);
    }

    @Override
    public void delete(String id) {
        if (!repository.existsById(id))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "RouteSegment not found");
        repository.deleteById(id);
    }

    @Override
    public List<RouteSegment> findByItineraryId(String itineraryId) {
        return repository.findByItineraryId(itineraryId);
    }

    @Override
    public void assignToItinerary(String segmentId, String itineraryId) {
        RouteSegment segment = findById(segmentId);
        TripItinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Itinerary not found"));

        if (segment.getItineraryId() == null || !segment.getItineraryId().equals(itineraryId)) {
            segment.setItineraryId(itineraryId);
            repository.save(segment);
        }

        if (!itinerary.getRouteSegmentIds().contains(segmentId)) {
            itinerary.getRouteSegmentIds().add(segmentId);
            itineraryRepository.save(itinerary);
        }
    }

    @Override
    public void addAlertToSegment(String segmentId, String alertId) {
        RouteSegment segment = findById(segmentId);
        SafetyAlert alert = safetyAlertRepository.findById(alertId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Safety Alert not found"));

        if (!segment.getSafetyAlertIds().contains(alertId)) {
            segment.getSafetyAlertIds().add(alertId);
            repository.save(segment);
        }

        if (alert.getRouteSegmentId() == null || !alert.getRouteSegmentId().equals(segmentId)) {
            alert.setRouteSegmentId(segmentId);
            safetyAlertRepository.save(alert);
        }
    }

    private void mapDtoToEntity(RouteSegmentDTO dto, RouteSegment entity) {
        if (dto.getItineraryId() != null)
            entity.setItineraryId(dto.getItineraryId());
        if (dto.getStartLocation() != null)
            entity.setStartLocation(dto.getStartLocation());
        if (dto.getEndLocation() != null)
            entity.setEndLocation(dto.getEndLocation());
        if (dto.getEstimatedTime() > 0)
            entity.setEstimatedTime(dto.getEstimatedTime());
        if (dto.getMode() != null)
            entity.setMode(dto.getMode());
        if (dto.getSafetyAlertIds() != null)
            entity.setSafetyAlertIds(dto.getSafetyAlertIds());
    }
}
