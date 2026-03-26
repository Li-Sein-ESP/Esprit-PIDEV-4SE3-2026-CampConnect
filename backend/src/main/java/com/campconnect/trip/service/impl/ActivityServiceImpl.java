package com.campconnect.trip.service.impl;

import com.campconnect.trip.dto.ActivityDTO;
import com.campconnect.trip.entity.Activity;
import com.campconnect.trip.repository.ActivityRepository;
import com.campconnect.trip.service.IActivityService;
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
public class ActivityServiceImpl implements IActivityService {
    private final ActivityRepository repository;
    private final TripItineraryRepository itineraryRepository;

    @Override
    public List<Activity> findAll() {
        return repository.findAll();
    }

    @Override
    public Activity findById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Activity not found"));
    }

    @Override
    public Activity save(ActivityDTO dto) {
        Activity entity = new Activity();
        if (dto.getId() != null && !dto.getId().isEmpty()) {
            entity.setId(dto.getId());
        } else {
            entity.setId(UUID.randomUUID().toString());
        }
        mapDtoToEntity(dto, entity);
        return repository.save(entity);
    }

    @Override
    public Activity update(String id, ActivityDTO dto) {
        Activity entity = findById(id);
        mapDtoToEntity(dto, entity);
        return repository.save(entity);
    }

    @Override
    public void delete(String id) {
        if (!repository.existsById(id))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Activity not found");
        repository.deleteById(id);
    }

    @Override
    public List<Activity> findByItineraryId(String itineraryId) {
        return repository.findByItineraryId(itineraryId);
    }

    @Override
    public void assignToItinerary(String activityId, String itineraryId) {
        Activity activity = findById(activityId);
        TripItinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Itinerary not found"));

        if (activity.getItineraryId() == null || !activity.getItineraryId().equals(itineraryId)) {
            activity.setItineraryId(itineraryId);
            repository.save(activity);
        }

        if (!itinerary.getActivityIds().contains(activityId)) {
            itinerary.getActivityIds().add(activityId);
            itineraryRepository.save(itinerary);
        }
    }

    private void mapDtoToEntity(ActivityDTO dto, Activity entity) {
        if (dto.getItineraryId() != null)
            entity.setItineraryId(dto.getItineraryId());
        if (dto.getName() != null)
            entity.setName(dto.getName());
        if (dto.getDescription() != null)
            entity.setDescription(dto.getDescription());
        if (dto.getLocation() != null)
            entity.setLocation(dto.getLocation());
        if (dto.getStartTime() != null)
            entity.setStartTime(dto.getStartTime());
        if (dto.getEndTime() != null)
            entity.setEndTime(dto.getEndTime());
        if (dto.getCost() != null)
            entity.setCost(dto.getCost());
    }
}
