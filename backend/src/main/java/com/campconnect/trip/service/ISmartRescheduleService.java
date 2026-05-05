package com.campconnect.trip.service;

import com.campconnect.trip.entity.Trip;
import java.util.List;

public interface ISmartRescheduleService {
    /**
     * Détecte les transports en retard et décale automatiquement les activités du voyage.
     */
    void autoRescheduleDelayedTrips();
    
    /**
     * Reschedule spécifique pour un trip avec filtrage par mots-clés.
     */
    void rescheduleTripActivities(String tripId, int delayMinutes, String activityKeyword);
}
