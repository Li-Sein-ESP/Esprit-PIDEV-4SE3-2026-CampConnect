package com.campconnect.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.campconnect.model.Group;

@Repository
public interface GroupRepository extends MongoRepository<Group, String> {
}
