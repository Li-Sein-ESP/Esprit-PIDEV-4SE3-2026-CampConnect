package com.campconnect.transport.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import com.campconnect.transport.entity.SafetyAlert;
import java.util.List;

@Repository("transportSafetyAlertRepository")
public interface SafetyAlertRepository extends MongoRepository<SafetyAlert, String> {
    List<SafetyAlert> findByRouteSegmentId(String routeSegmentId);
}
