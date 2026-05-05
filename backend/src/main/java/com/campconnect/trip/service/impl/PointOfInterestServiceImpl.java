package com.campconnect.trip.service.impl;

import com.campconnect.trip.dto.PointOfInterestDTO;
import com.campconnect.trip.entity.PointOfInterest;
import com.campconnect.trip.repository.PointOfInterestRepository;
import com.campconnect.trip.service.IPointOfInterestService;
import com.campconnect.trip.repository.TripItineraryRepository;
import com.campconnect.trip.entity.TripItinerary;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PointOfInterestServiceImpl implements IPointOfInterestService {
    private final PointOfInterestRepository repository;
    private final TripItineraryRepository itineraryRepository;

    @Override
    public List<PointOfInterest> findAll() {
        return repository.findAll();
    }

    @Override
    public PointOfInterest findById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "POI not found"));
    }

    @Override
    public PointOfInterest save(PointOfInterestDTO dto) {
        PointOfInterest entity = new PointOfInterest();
        if (dto.getId() != null && !dto.getId().isEmpty()) {
            entity.setId(dto.getId());
        } else {
            entity.setId(UUID.randomUUID().toString());
        }
        mapDtoToEntity(dto, entity);
        return repository.save(entity);
    }

    @Override
    public PointOfInterest update(String id, PointOfInterestDTO dto) {
        PointOfInterest entity = findById(id);
        mapDtoToEntity(dto, entity);
        return repository.save(entity);
    }

    @Override
    public void delete(String id) {
        if (!repository.existsById(id))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "POI not found");
        repository.deleteById(id);
    }

    @Override
    public List<PointOfInterest> findByItineraryId(String itineraryId) {
        return repository.findByItineraryId(itineraryId);
    }

    @Override
    public void assignToItinerary(String poiId, String itineraryId) {
        PointOfInterest poi = findById(poiId);
        TripItinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Itinerary not found"));

        if (poi.getItineraryId() == null || !poi.getItineraryId().equals(itineraryId)) {
            poi.setItineraryId(itineraryId);
            repository.save(poi);
        }

        if (!itinerary.getPoiIds().contains(poiId)) {
            itinerary.getPoiIds().add(poiId);
            itineraryRepository.save(itinerary);
        }
    }

    private void mapDtoToEntity(PointOfInterestDTO dto, PointOfInterest entity) {
        if (dto.getItineraryId() != null)
            entity.setItineraryId(dto.getItineraryId());
        if (dto.getName() != null)
            entity.setName(dto.getName());
        if (dto.getLocation() != null)
            entity.setLocation(dto.getLocation());
        if (dto.getCategory() != null)
            entity.setCategory(dto.getCategory());
        if (dto.getDescription() != null)
            entity.setDescription(dto.getDescription());
        if (dto.getImageUrl() != null)
            entity.setImageUrl(dto.getImageUrl());
    }
}
