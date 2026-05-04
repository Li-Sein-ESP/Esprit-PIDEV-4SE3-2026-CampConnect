package com.campconnect.scheduler;

import com.campconnect.transport.entity.Transport;
import com.campconnect.transport.enums.TransportStatus;
import com.campconnect.transport.repository.TransportRepository;
import com.campconnect.trip.entity.Trip;
import com.campconnect.trip.enums.TripStatus;
import com.campconnect.trip.repository.TripRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * TÃƒâ€šCHE PROPOSITION 1 : Maintenance automatique des ressources.
 * Ce scheduler vÃƒÂ©rifie pÃƒÂ©riodiquement les voyages annulÃƒÂ©s et libÃƒÂ¨re les transports associÃƒÂ©s.
 */
@Component
public class TripMaintenanceScheduler {

    private static final Logger logger = LoggerFactory.getLogger(TripMaintenanceScheduler.class);

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private TransportRepository transportRepository;

    // ExÃƒÂ©cution tous les soirs ÃƒÂ  minuit (cron = "0 0 0 * * ?")
    // Pour les tests, on peut mettre toutes les 5 minutes (cron = "0 */5 * * * ?")
    @Scheduled(cron = "0 0 0 * * ?")
    public void cleanupCancelledTripsResources() {
        logger.info("[SCHEDULER] Starting resource cleanup for CANCELLED trips at {}", LocalDateTime.now());

        // 1. Trouver tous les voyages annulÃƒÂ©s qui ont encore des transports liÃƒÂ©s
        List<Trip> cancelledTrips = tripRepository.findAll().stream()
                .filter(trip -> trip.getStatus() == TripStatus.CANCELLED)
                .filter(trip -> trip.getTransportIds() != null && !trip.getTransportIds().isEmpty())
                .toList();

        int cleanedCount = 0;

        for (Trip trip : cancelledTrips) {
            for (String transportId : trip.getTransportIds()) {
                transportRepository.findById(transportId).ifPresent(transport -> {
                    // LibÃƒÂ©ration du transport
                    transport.setTripId(null);
                    transport.setStatus(TransportStatus.AVAILABLE);
                    transportRepository.save(transport);
                    logger.info("[SCHEDULER] Transport {} released from cancelled Trip {}", transportId, trip.getId());
                });
            }
            // Optionnel : On vide la liste des transports du voyage pour ne pas recommencer la prochaine fois
            trip.getTransportIds().clear();
            tripRepository.save(trip);
            cleanedCount++;
        }

        logger.info("[SCHEDULER] Cleanup completed. {} trips processed.", cleanedCount);
    }
}
