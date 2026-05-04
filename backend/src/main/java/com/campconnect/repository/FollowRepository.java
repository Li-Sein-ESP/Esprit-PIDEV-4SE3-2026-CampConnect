package com.campconnect.repository;

import com.campconnect.model.Follow;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FollowRepository extends MongoRepository<Follow, String> {
    List<Follow> findByFollowerId(String followerId);
    List<Follow> findByFollowingId(String followingId);
    Optional<Follow> findByFollowerIdAndFollowingId(String followerId, String followingId);
    boolean existsByFollowerIdAndFollowingId(String followerId, String followingId);
    void deleteByFollowerIdAndFollowingId(String followerId, String followingId);
    long countByFollowerId(String followerId);
    long countByFollowingId(String followingId);

    // ── Fonction Keywords (multi-critères) ──────────────────────────────────
    // Trouver les personnes suivies par un utilisateur depuis une date donnée
    // Utilisation : afficher les "nouveaux abonnements" des 7 derniers jours
    List<Follow> findByFollowerIdAndCreatedAtAfter(String followerId, LocalDateTime since);
}
