package com.campconnect.repository;

import com.campconnect.entity.ForumThread;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ForumThreadRepository extends MongoRepository<ForumThread, String> {
}
