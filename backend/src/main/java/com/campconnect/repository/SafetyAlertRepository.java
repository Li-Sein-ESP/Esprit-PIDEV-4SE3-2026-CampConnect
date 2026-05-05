package com.campconnect.repository;

import com.campconnect.model.SafetyAlert;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SafetyAlertRepository extends MongoRepository<SafetyAlert, String> {
    @Query("{ 'trip.$id' : ?0 }")
    List<SafetyAlert> findByTripId(String tripId);

    @Query("{ 'status' : ?0 }")
    List<SafetyAlert> findByStatus(String status);
}
