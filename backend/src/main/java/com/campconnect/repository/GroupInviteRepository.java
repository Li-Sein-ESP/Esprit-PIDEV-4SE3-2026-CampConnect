package com.campconnect.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.campconnect.model.GroupInvite;
import com.campconnect.model.GroupInviteStatus;

@Repository
public interface GroupInviteRepository extends MongoRepository<GroupInvite, String> {
    List<GroupInvite> findByToUserId(String toUserId);

    List<GroupInvite> findByGroupId(String groupId);

    List<GroupInvite> findByTripIntentId(String tripIntentId);

    List<GroupInvite> findByStatus(GroupInviteStatus status);
}
