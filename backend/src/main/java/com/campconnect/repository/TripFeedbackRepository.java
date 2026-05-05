package com.campconnect.repository;

import com.campconnect.model.TripFeedback;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripFeedbackRepository extends MongoRepository<TripFeedback, String> {
    List<TripFeedback> findByTripId(String tripId);
    List<TripFeedback> findByEvaluatorUserIdAndTripId(String evaluatorUserId, String tripId);
    List<TripFeedback> findByEvaluatedUserId(String evaluatedUserId);
}
