package com.campconnect.repository;

import com.campconnect.model.UserStats;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserStatsRepository extends MongoRepository<UserStats, String> {
    Optional<UserStats> findByUserId(String userId);
    java.util.List<UserStats> findByTrustScoreLessThan(int threshold);
}
