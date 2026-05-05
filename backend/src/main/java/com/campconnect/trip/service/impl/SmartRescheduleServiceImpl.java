package com.campconnect.trip.service.impl;

import com.campconnect.transport.entity.Transport;
import com.campconnect.transport.enums.TransportStatus;
import com.campconnect.transport.repository.TransportRepository;
import com.campconnect.trip.entity.Activity;
import com.campconnect.trip.entity.Trip;
import com.campconnect.trip.entity.TripItinerary;
import com.campconnect.trip.repository.ActivityRepository;
import com.campconnect.trip.repository.TripItineraryRepository;
import com.campconnect.trip.repository.TripRepository;
import com.campconnect.trip.service.ISmartRescheduleService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SmartRescheduleServiceImpl implements ISmartRescheduleService {

    private static final Logger logger = LoggerFactory.getLogger(SmartRescheduleServiceImpl.class);
    
    private final TripRepository tripRepository;
    private final TransportRepository transportRepository;
    private final TripItineraryRepository itineraryRepository;
    private final ActivityRepository activityRepository;

    @Override
    public void autoRescheduleDelayedTrips() {
        // Logique NoSQL optimisée : Remplacement du findAll() par un filtrage direct (Keywords)
        List<Transport> delayedTransports = transportRepository.findByStatusAndDelayMinutesGreaterThan(TransportStatus.DELAYED, 0);

        for (Transport transport : delayedTransports) {
            String tripId = transport.getTripId();
            if (tripId == null) continue;

            logger.info("[SMART_RESCHEDULE] Delay detected for Transport {} in Trip {}: {} minutes", 
                    transport.getId(), tripId, transport.getDelayMinutes());

            // Appliquer le décalage à toutes les activités du trip
            rescheduleTripActivities(tripId, transport.getDelayMinutes(), null);

            // Une fois replanifié, on peut marquer le retard comme "traité" ou remettre à zéro
            transport.setStatus(TransportStatus.AVAILABLE);
            transport.setDelayMinutes(0);
            transportRepository.save(transport);
        }
    }

    @Override
    public void rescheduleTripActivities(String tripId, int delayMinutes, String activityKeyword) {
        // 1. Récupérer le Trip
        Trip trip = tripRepository.findById(tripId).orElse(null);
        if (trip == null) return;

        // 2. Récupérer les Itinéraires (Jours) du trip
        List<TripItinerary> itineraries = itineraryRepository.findByTripId(tripId);

        for (TripItinerary itinerary : itineraries) {
            // 3. Récupérer les Activités de chaque jour
            List<Activity> activities = activityRepository.findByItineraryId(itinerary.getId());

            for (Activity activity : activities) {
                // Filtrage par Keywords si spécifié
                if (activityKeyword != null && !activityKeyword.isEmpty()) {
                    if (!activity.getName().toLowerCase().contains(activityKeyword.toLowerCase()) && 
                        !activity.getDescription().toLowerCase().contains(activityKeyword.toLowerCase())) {
                        continue;
                    }
                }

                // 4. Décaler automatiquement le planning (Smart Shift)
                if (activity.getStartTime() != null) {
                    activity.setStartTime(activity.getStartTime().plus(Duration.ofMinutes(delayMinutes)));
                }
                if (activity.getEndTime() != null) {
                    activity.setEndTime(activity.getEndTime().plus(Duration.ofMinutes(delayMinutes)));
                }

                activityRepository.save(activity);
                logger.debug("[SMART_RESCHEDULE] Activity '{}' shifted by {} min", activity.getName(), delayMinutes);
            }
        }
        
        logger.info("[SMART_RESCHEDULE] Trip '{}' successfully rescheduled due to transport delay.", trip.getTitle());
    }
}
