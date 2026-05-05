package com.campconnect.service;

import com.campconnect.model.Notification;
import com.campconnect.repository.NotificationRepository;
import com.campconnect.transport.entity.Transport;
import com.campconnect.transport.repository.TransportRepository;
import com.campconnect.trip.entity.Activity;
import com.campconnect.trip.entity.Trip;
import com.campconnect.trip.repository.ActivityRepository;
import com.campconnect.trip.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ItineraryNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(ItineraryNotificationService.class);
    
    private final NotificationRepository notificationRepository;
    private final TransportRepository transportRepository;
    private final ActivityRepository activityRepository;
    private final TripRepository tripRepository;

    /**
     * Scanne les activités et transports prévus dans l'heure qui vient
     * et génère des notifications pour les utilisateurs concernés.
     */
    public void generateUpcomingEventNotifications() {
        Instant now = Instant.now();
        Instant oneHourFromNow = now.plus(1, ChronoUnit.HOURS);

        logger.info("[NOTIFICATION_ENGINE] Scanning for upcoming events between {} and {}", now, oneHourFromNow);

        // 1. Notifications pour les ACTIVITÉS
        List<Activity> upcomingActivities = activityRepository.findAll().stream()
                .filter(a -> a.getStartTime() != null && 
                             a.getStartTime().isAfter(now) && 
                             a.getStartTime().isBefore(oneHourFromNow))
                .toList();

        for (Activity activity : upcomingActivities) {
            Trip trip = tripRepository.findAll().stream()
                    .filter(t -> t.getItineraryIds().contains(activity.getItineraryId()))
                    .findFirst().orElse(null);

            if (trip != null && trip.getUserId() != null) {
                sendNotification(trip.getUserId(), "Prochaine Activité", 
                    "Votre activité '" + activity.getName() + "' commence bientôt !", "ACTIVITY", trip.getId());
            }
        }

        // 2. Notifications pour les TRANSPORTS
        List<Transport> upcomingTransports = transportRepository.findAll().stream()
                .filter(t -> t.getDepartureTime() != null && 
                             t.getDepartureTime().isAfter(now) && 
                             t.getDepartureTime().isBefore(oneHourFromNow))
                .toList();

        for (Transport transport : upcomingTransports) {
            if (transport.getTripId() != null) {
                Trip trip = tripRepository.findById(transport.getTripId()).orElse(null);
                if (trip != null && trip.getUserId() != null) {
                    sendNotification(trip.getUserId(), "Départ Imminent", 
                        "Votre transport '" + transport.getProvider() + "' (" + transport.getMode() + ") part dans moins d'une heure.", "TRANSPORT", trip.getId());
                }
            }
        }
    }

    private void sendNotification(String userId, String title, String message, String type, String relatedId) {
        // Éviter les doublons (ne pas renvoyer la même notification dans la même heure)
        // Pour cet exemple, on simplifie en créant systématiquement
        Notification notification = Notification.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .type(type)
                .relatedId(relatedId)
                .build();
        
        notificationRepository.save(notification);
        logger.info("[NOTIFICATION_SENT] User: {}, Type: {}, Message: {}", userId, type, message);
    }
}
