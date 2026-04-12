package com.campconnect.repository;

import com.campconnect.model.SafetyAlert;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SafetyAlertRepository extends MongoRepository<SafetyAlert, String> {
}
