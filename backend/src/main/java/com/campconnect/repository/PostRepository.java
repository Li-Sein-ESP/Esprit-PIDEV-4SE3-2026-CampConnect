package com.campconnect.repository;

import com.campconnect.model.Post;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PostRepository extends MongoRepository<Post, String> {
    void deleteByThreadId(String threadId);
}
