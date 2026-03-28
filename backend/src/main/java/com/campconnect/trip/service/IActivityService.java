package com.campconnect.trip.service;

import com.campconnect.trip.dto.ActivityDTO;
import com.campconnect.trip.entity.Activity;
import java.util.List;

public interface IActivityService {
    List<Activity> findAll();

    Activity findById(String id);

    Activity save(ActivityDTO dto);

    Activity update(String id, ActivityDTO dto);

    void delete(String id);

    List<Activity> findByItineraryId(String itineraryId);

    void assignToItinerary(String activityId, String itineraryId);
}
