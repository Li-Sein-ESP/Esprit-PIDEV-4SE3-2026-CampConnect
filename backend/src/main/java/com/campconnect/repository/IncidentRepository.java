package com.campconnect.repository;

<<<<<<< HEAD
import com.campconnect.model.Incident;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
=======
import com.campconnect.dto.OpenIncidentSummaryDTO;
import com.campconnect.model.Incident;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
import java.util.List;

@Repository
public interface IncidentRepository extends MongoRepository<Incident, String> {
<<<<<<< HEAD
    List<Incident> findByTripId(String tripId);
    List<Incident> findByReporterId(String reporterId);
=======
    @Query("{ 'tripId' : ?0 }")
    List<Incident> findByTripId(String tripId);
    
    @Query("{ 'reporterId' : ?0 }")
    List<Incident> findByReporterId(String reporterId);

    @Query("{ 'status' : ?0 }")
    List<Incident> findByStatus(String status);

    List<Incident> findByStatusAndCreatedAtBefore(String status, LocalDateTime cutoff);

    List<Incident> findByTripIdInAndStatusAndSeverityIn(List<String> tripIds, String status, List<String> severities);

    @Aggregation(pipeline = {
            "{ '$match': { 'status': 'pending' } }",
            "{ '$group': { '_id': { region: '$regionName', tripId: '$tripId', reporterId: '$reporterId' }, openIncidentCount: { '$sum': 1 } } }",
            "{ '$project': { _id: 0, region: '$_id.region', tripId: '$_id.tripId', reporterId: '$_id.reporterId', openIncidentCount: 1 } }",
            "{ '$sort': { openIncidentCount: -1 } }"
    })
    List<OpenIncidentSummaryDTO> findOpenIncidentSummary();
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
}
