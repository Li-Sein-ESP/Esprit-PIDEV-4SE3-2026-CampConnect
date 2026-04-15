package com.campconnect.repository;

import com.campconnect.model.Campsite;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CampsiteRepository extends MongoRepository<Campsite, String> {
    List<Campsite> findByAvailable(Boolean available);
    List<Campsite> findByLocationContainingIgnoreCase(String location);
}
