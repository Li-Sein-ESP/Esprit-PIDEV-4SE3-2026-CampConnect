package com.campconnect.repository;

import com.campconnect.model.Incident;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface IncidentRepository extends MongoRepository<Incident, String> {
    List<Incident> findByTripId(String tripId);
    List<Incident> findByReporterId(String reporterId);
}
