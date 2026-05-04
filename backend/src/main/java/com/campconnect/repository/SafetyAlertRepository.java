package com.campconnect.repository;

import com.campconnect.model.SafetyAlert;
import org.springframework.data.mongodb.repository.MongoRepository;
<<<<<<< HEAD
import org.springframework.stereotype.Repository;

@Repository
public interface SafetyAlertRepository extends MongoRepository<SafetyAlert, String> {
=======
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SafetyAlertRepository extends MongoRepository<SafetyAlert, String> {
    @Query("{ 'trip.$id' : ?0 }")
    List<SafetyAlert> findByTripId(String tripId);

    @Query("{ 'status' : ?0 }")
    List<SafetyAlert> findByStatus(String status);
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
}
