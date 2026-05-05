package com.campconnect.repository;

import com.campconnect.entity.Video;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VideoRepository extends MongoRepository<Video, String> {
    List<Video> findByCategory(String category);
    List<Video> findByType(String type);
}
