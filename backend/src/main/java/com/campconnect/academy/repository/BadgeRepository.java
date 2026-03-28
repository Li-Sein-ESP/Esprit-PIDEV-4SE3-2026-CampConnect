package com.campconnect.academy.repository;

import com.campconnect.academy.entity.Badge;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BadgeRepository extends MongoRepository<Badge, String> {
}
