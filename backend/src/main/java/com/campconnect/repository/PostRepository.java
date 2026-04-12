package com.campconnect.repository;

import com.campconnect.model.Post;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PostRepository extends MongoRepository<Post, String> {
    List<Post> findByThreadId(String threadId);
    void deleteByThreadId(String threadId);
}
