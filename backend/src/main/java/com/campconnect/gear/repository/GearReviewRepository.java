package com.campconnect.gear.repository;

import com.campconnect.gear.model.GearReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GearReviewRepository extends MongoRepository<GearReview, String> {
    Page<GearReview> findByGearId(String gearId, Pageable pageable);
    Page<GearReview> findByReviewerId(String reviewerId, Pageable pageable);
    boolean existsByGearIdAndReviewerId(String gearId, String reviewerId);
}
