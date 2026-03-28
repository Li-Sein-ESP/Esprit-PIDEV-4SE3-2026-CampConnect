package com.campconnect.repository;

import com.campconnect.model.Season;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeasonRepository extends MongoRepository<Season, String> {
    List<Season> findByCampsiteId(String campsiteId);
    List<Season> findByIsOpen(Boolean isOpen);
}
