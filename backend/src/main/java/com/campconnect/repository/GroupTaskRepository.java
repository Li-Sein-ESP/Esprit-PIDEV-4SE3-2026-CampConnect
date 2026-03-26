package com.campconnect.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.campconnect.model.GroupTask;

@Repository
public interface GroupTaskRepository extends MongoRepository<GroupTask, String> {
    List<GroupTask> findByGroupId(String groupId);
}
