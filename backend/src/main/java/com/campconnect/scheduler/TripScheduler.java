package com.campconnect.scheduler;

import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.campconnect.model.TripIntent;
import com.campconnect.model.TripIntentStatus;
import com.campconnect.model.Group;
import com.campconnect.model.GroupStatus;
import com.campconnect.model.Reservation;
import com.campconnect.model.ReservationStatus;
import com.campconnect.repository.TripIntentRepository;
import com.campconnect.repository.GroupRepository;
import com.campconnect.repository.ReservationRepository;

@Component
public class TripScheduler {

    private static final Logger log = LoggerFactory.getLogger(TripScheduler.class);

    private final TripIntentRepository tripIntentRepository;
    private final GroupRepository groupRepository;
    private final ReservationRepository reservationRepository;

    public TripScheduler(TripIntentRepository tripIntentRepository, GroupRepository groupRepository, ReservationRepository reservationRepository) {
        this.tripIntentRepository = tripIntentRepository;
        this.groupRepository = groupRepository;
        this.reservationRepository = reservationRepository;
    }

    /**
     * S'exécute automatiquement toutes les 5 minutes pour clôturer les voyages expirés.
     */
    @Scheduled(cron = "0 */5 * * * *")
    public void processExpiredTrips() {
        log.info("Lancement du traitement automatique des expirations...");
        
        LocalDateTime now = LocalDateTime.now();
        
        // 1. Clôturer les TripIntents expirés
        List<TripIntentStatus> activeStatuses = List.of(TripIntentStatus.OPEN, TripIntentStatus.DRAFT);
        for (TripIntentStatus status : activeStatuses) {
            List<TripIntent> trips = tripIntentRepository.findByStatus(status);
            for (TripIntent trip : trips) {
                if (trip.getDateTo() != null && trip.getDateTo().isBefore(now)) {
                    log.info("Expiration du voyage: {}", trip.getTitle());
                    trip.setStatus(TripIntentStatus.CLOSED);
                    tripIntentRepository.save(trip);
                }
            }
        }

        // 2. Synchroniser les GROUPES (Important pour les groupes déjà créés)
        List<Group> activeGroups = groupRepository.findAll(); // On vérifie tout pour être sûr
        int groupCount = 0;
        for (Group group : activeGroups) {
            if (group.getStatus() == GroupStatus.ACTIVE && group.getTripId() != null) {
                // Trouver le voyage associé
                tripIntentRepository.findById(group.getTripId()).ifPresent(trip -> {
                    if (trip.getStatus() == TripIntentStatus.CLOSED || (trip.getDateTo() != null && trip.getDateTo().isBefore(now))) {
                        log.info(">>> Le groupe '{}' est lié à un voyage expiré/clos. Passage en INACTIVE.", group.getName());
                        group.setStatus(GroupStatus.INACTIVE);
                        groupRepository.save(group);
                    }
                });
            }
        }
        
        log.info("Traitement de synchronisation terminé.");
    }

    /**
     * S'exécute automatiquement toutes les 2 minutes  pour calculer la popularité.
     */
    @Scheduled(cron = "0 */2 * * * *")
    public void updateTrendingTrips() {
        log.info("Lancement du calcul de popularité (Trending Trips)...");

        // 1. Reset currently trending trips
        List<TripIntent> currentTrending = tripIntentRepository.findByIsTrendingTrue();
        for (TripIntent trip : currentTrending) {
            trip.setTrending(false);
        }
        if (!currentTrending.isEmpty()) {
            tripIntentRepository.saveAll(currentTrending);
        }

        // 2. Find new trending candidates and mark them
        List<TripIntent> trendingCandidates = tripIntentRepository.findTrendingCandidates();
        int count = 0;
        for (TripIntent trip : trendingCandidates) {
            trip.setTrending(true);
            tripIntentRepository.save(trip);
            count++;
        }

        log.info("{} voyages marqués comme Trending aujourd'hui.", count);
    }

    /**
     * S'exécute automatiquement toutes les 5 minutes pour nettoyer les réservations passées.
     */
    @Scheduled(cron = "0 */5 * * * *")
    public void processExpiredReservations() {
        log.info("Lancement du nettoyage des réservations expirées...");
        LocalDateTime now = LocalDateTime.now();
        List<Reservation> allReservations = reservationRepository.findAll();
        int updated = 0;
        for (Reservation res : allReservations) {
            // If it's pending and start date has passed, cancel it
            if (res.getStatus() == ReservationStatus.PENDING && res.getStartDate() != null && res.getStartDate().isBefore(now)) {
                log.info("Annulation de la réservation expirée: {}", res.getId());
                res.setStatus(ReservationStatus.CANCELLED);
                reservationRepository.save(res);
                updated++;
            }
            // If it's confirmed and end date has passed, complete it
            else if (res.getStatus() == ReservationStatus.CONFIRMED && res.getEndDate() != null && res.getEndDate().isBefore(now)) {
                log.info("Clôture de la réservation terminée: {}", res.getId());
                res.setStatus(ReservationStatus.COMPLETED);
                reservationRepository.save(res);
                updated++;
            }
        }
        log.info("{} réservations mises à jour.", updated);
    }
}
