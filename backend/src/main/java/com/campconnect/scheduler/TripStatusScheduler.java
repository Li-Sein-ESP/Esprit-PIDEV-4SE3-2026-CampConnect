package com.campconnect.scheduler;

import com.campconnect.trip.entity.Trip;
import com.campconnect.trip.enums.TripStatus;
import com.campconnect.trip.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

@Component
@RequiredArgsConstructor
public class TripStatusScheduler {

    private static final Logger logger = LoggerFactory.getLogger(TripStatusScheduler.class);
    private final TripRepository tripRepository;

    /**
     * S'exécute toutes les heures pour mettre à jour les statuts des voyages
     * en fonction du temps réel.
     */
    @Scheduled(fixedRate = 3600000) // 1 heure
    public void autoUpdateTripStatuses() {
        Instant now = Instant.now();
        logger.info("[STATUS_ENGINE] Starting automatic status synchronization cycle at {}", now);

        // 1. PLANNED -> ONGOING
        List<Trip> plannedToOngoing = tripRepository.findAll().stream()
                .filter(t -> t.getStatus() == TripStatus.PLANNED && 
                             t.getStartDate() != null && 
                             t.getStartDate().isBefore(now) && 
                             t.getEndDate() != null && 
                             t.getEndDate().isAfter(now))
                .toList();

        for (Trip trip : plannedToOngoing) {
            trip.setStatus(TripStatus.ONGOING);
            tripRepository.save(trip);
            logger.info("[STATUS_CHANGE] Trip '{}' is now ONGOING (started at {})", trip.getTitle(), trip.getStartDate());
        }

        // 2. ONGOING -> COMPLETED
        List<Trip> ongoingToCompleted = tripRepository.findAll().stream()
                .filter(t -> (t.getStatus() == TripStatus.ONGOING || t.getStatus() == TripStatus.PLANNED) && 
                             t.getEndDate() != null && 
                             t.getEndDate().isBefore(now))
                .toList();

        for (Trip trip : ongoingToCompleted) {
            trip.setStatus(TripStatus.COMPLETED);
            tripRepository.save(trip);
            logger.info("[STATUS_CHANGE] Trip '{}' is now COMPLETED (ended at {})", trip.getTitle(), trip.getEndDate());
        }
        
        logger.info("[STATUS_ENGINE] Synchronization cycle complete.");
    }
}
