package com.campconnect.repository;

import com.campconnect.model.CampsiteReview;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CampsiteReviewRepository extends MongoRepository<CampsiteReview, String> {
    List<CampsiteReview> findByCampsiteIdOrderByCreatedAtDesc(String campsiteId);
}
