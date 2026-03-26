package com.campconnect.transport.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.campconnect.transport.entity.SafetyAlert;
import java.util.List;

public interface SafetyAlertRepository extends MongoRepository<SafetyAlert, String> {
    List<SafetyAlert> findByRouteSegmentId(String routeSegmentId);
}
