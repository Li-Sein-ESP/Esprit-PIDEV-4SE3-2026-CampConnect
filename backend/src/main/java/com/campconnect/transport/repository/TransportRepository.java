package com.campconnect.transport.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.campconnect.transport.entity.Transport;
import java.util.List;

public interface TransportRepository extends MongoRepository<Transport, String> {
    List<Transport> findByTripId(String tripId);
<<<<<<< HEAD
=======

    // TÂCHE PROPOSITION 2 : Jointure complexe (Aggregation lookup) pour la popularité
    @org.springframework.data.mongodb.repository.Aggregation(pipeline = {
        "{ '$lookup': { 'from': 'trip_itineraries_main', 'localField': 'tripId', 'foreignField': '_id', 'as': 'tripDetails' } }",
        "{ '$group': { '_id': '$mode', 'usageCount': { '$sum': 1 }, 'averageCost': { '$avg': '$cost' } } }",
        "{ '$sort': { 'usageCount': -1 } }"
    })
    java.util.List<java.util.Map<String, Object>> getTransportPopularityStats();
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
}
