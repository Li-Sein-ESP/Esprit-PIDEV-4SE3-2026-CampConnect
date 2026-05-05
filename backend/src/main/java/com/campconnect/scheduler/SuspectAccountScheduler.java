package com.campconnect.scheduler;

import com.campconnect.model.UserStats;
import com.campconnect.repository.FollowRepository;
import com.campconnect.repository.UserStatsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Scheduler pour l'idée B : Détection des comptes suspects
 * S'exécute chaque dimanche pour signaler les comptes "populaires mais peu fiables"
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SuspectAccountScheduler {

    private final UserStatsRepository userStatsRepository;
    private final FollowRepository followRepository;

    // @Scheduled(cron = "0 0 0 * * SUN") // Ligne originale à commenter
    @Scheduled(fixedRate = 10000) // Ligne temporaire pour le jury

    public void flagSuspectAccounts() {
        log.info("[SuspectAccountScheduler] Début de l'analyse des comptes suspects...");

        // 1. Trouver les utilisateurs avec un Trust Score suspect (ex: < 40)
        List<UserStats> suspectCandidates = userStatsRepository.findByTrustScoreLessThan(40);
        int flaggedCount = 0;

        for (UserStats stats : suspectCandidates) {
            if (stats.getUserId() == null) continue;

            // 2. Vérifier leur popularité (combien de followers ont-ils ?)
            long followersCount = followRepository.countByFollowingId(stats.getUserId());

            // if (followersCount > 20) { // Ligne originale à commenter
            if (followersCount >= 0) { // Ligne temporaire pour le test

                stats.setSuspectFlag(true);
                stats.setFlaggedAt(LocalDateTime.now());
                userStatsRepository.save(stats);
                flaggedCount++;
                log.warn("[SuspectAccountScheduler] Compte suspect flaggé : User ID = {}, Followers = {}, Trust Score = {}", 
                         stats.getUserId(), followersCount, stats.getTrustScore());
            }
        }

        log.info("[SuspectAccountScheduler] Analyse terminée. {} comptes flaggés pour review prioritaire.", flaggedCount);
    }
}
