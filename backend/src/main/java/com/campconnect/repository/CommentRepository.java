package com.campconnect.repository;

import com.campconnect.model.Comment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CommentRepository extends MongoRepository<Comment, String> {
    @Query("{ 'postId' : ?0 }")
    List<Comment> findByPostId(String postId);
}
