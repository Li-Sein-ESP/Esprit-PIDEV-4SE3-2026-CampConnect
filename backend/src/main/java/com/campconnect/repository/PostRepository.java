package com.campconnect.repository;

import com.campconnect.model.Post;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PostRepository extends MongoRepository<Post, String> {
    void deleteByThreadId(String threadId);
    
    @Query("{ 'threadId' : ?0 }")
    List<Post> findByThreadId(String threadId);
}
