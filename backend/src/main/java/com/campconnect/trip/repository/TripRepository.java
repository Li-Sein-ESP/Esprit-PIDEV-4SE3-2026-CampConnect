package com.campconnect.trip.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import com.campconnect.trip.entity.Trip;
import java.util.List;

@Repository("itineraryTripRepository")
public interface TripRepository extends MongoRepository<Trip, String> {
    List<Trip> findByUserId(String userId);

    List<Trip> findByTemplate(boolean template);
<<<<<<< HEAD
=======

    // 3. Complex Keyword Query: Search by title OR destination address
    List<Trip> findByTitleContainingIgnoreCaseOrDestinationAddressContainingIgnoreCase(String title, String address);

    // TÂCHE PROPOSITION 3 : Recherche Keywords Multi-critères + difficulté
    List<Trip> findByDifficultyAndDestinationAddressContainingIgnoreCase(com.campconnect.trip.enums.DifficultyLevel difficulty, String address);

    // 2. Complex Aggregation: Analytics of Trips per Difficulty
    @org.springframework.data.mongodb.repository.Aggregation(pipeline = {
        "{ '$group': { '_id': '$difficulty', 'tripCount': { '$sum': 1 } } }",
        "{ '$sort': { 'tripCount': -1 } }"
    })
    java.util.List<java.util.Map<String, Object>> getTripStatsByDifficulty();
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
}
