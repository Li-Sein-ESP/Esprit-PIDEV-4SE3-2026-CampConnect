package com.campconnect.repository;

import com.campconnect.model.ForumThread;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ForumThreadRepository extends MongoRepository<ForumThread, String> {
}
