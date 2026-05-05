package com.campconnect.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.campconnect.model.GroupMergeProposal;

@Repository
public interface GroupMergeProposalRepository extends MongoRepository<GroupMergeProposal, String> {
    List<GroupMergeProposal> findBySourceGroupIdAndStatus(String sourceGroupId, String status);
    List<GroupMergeProposal> findByTargetGroupIdAndStatus(String targetGroupId, String status);
    Optional<GroupMergeProposal> findBySourceGroupIdAndTargetGroupId(String sourceGroupId, String targetGroupId);
}
