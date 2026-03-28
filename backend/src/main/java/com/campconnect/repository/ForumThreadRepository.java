package com.campconnect.repository;

import com.campconnect.model.ForumThread;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ForumThreadRepository extends MongoRepository<ForumThread, String> {
    List<ForumThread> findByCategory(String category);
    List<ForumThread> findByAuthorId(String authorId);
}
