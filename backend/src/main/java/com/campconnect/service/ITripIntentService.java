package com.campconnect.service;

import java.util.List;

import com.campconnect.model.TripIntent;

public interface ITripIntentService {
    TripIntent createTripIntent(TripIntent tripIntent);

    TripIntent getTripIntentById(String id);

    TripIntent getTripIntentById(String id, String currentUserId);

    List<TripIntent> getTripIntentsByCreator(String creatorUserId);

    List<TripIntent> getAllOpenTripIntents(String currentUserId);

    List<TripIntent> getAllOpenTripIntents();

    TripIntent updateTripIntent(String id, TripIntent tripIntent);

    void deleteTripIntent(String id);
}
