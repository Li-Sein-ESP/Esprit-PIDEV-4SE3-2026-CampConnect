package com.campconnect.repository;

import com.campconnect.entity.Comment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CommentRepository extends MongoRepository<Comment, String> {
    List<Comment> findByPost(com.campconnect.entity.Post post);
    void deleteByPost(com.campconnect.entity.Post post);
}
