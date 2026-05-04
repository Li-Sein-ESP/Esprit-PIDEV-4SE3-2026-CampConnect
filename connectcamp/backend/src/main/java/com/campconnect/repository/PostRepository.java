package com.campconnect.repository;

import com.campconnect.entity.Post;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PostRepository extends MongoRepository<Post, String> {
    List<Post> findByThread(com.campconnect.entity.ForumThread thread);
    void deleteByThread(com.campconnect.entity.ForumThread thread);
}
