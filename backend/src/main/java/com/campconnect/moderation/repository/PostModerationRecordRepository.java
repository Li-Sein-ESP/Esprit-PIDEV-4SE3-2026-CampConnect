package com.campconnect.moderation.repository;

import com.campconnect.moderation.ModerationDecision;
import com.campconnect.moderation.model.PostModerationRecord;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostModerationRecordRepository extends MongoRepository<PostModerationRecord, String> {
    List<PostModerationRecord> findByStatusOrderByCreatedAtDesc(String status);
    Optional<PostModerationRecord> findByPostId(String postId);
    long countByAuthorIdAndDecision(String authorId, ModerationDecision decision);
}
