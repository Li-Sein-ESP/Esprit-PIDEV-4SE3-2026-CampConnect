package com.campconnect.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.campconnect.model.GroupDecision;

@Repository
public interface GroupDecisionRepository extends MongoRepository<GroupDecision, String> {
    List<GroupDecision> findByGroupId(String groupId);
}
