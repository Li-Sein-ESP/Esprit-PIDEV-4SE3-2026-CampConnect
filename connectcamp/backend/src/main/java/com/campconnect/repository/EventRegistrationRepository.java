package com.campconnect.repository;

import com.campconnect.entity.EventRegistration;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EventRegistrationRepository extends MongoRepository<EventRegistration, String> {
    List<EventRegistration> findByEventId(String eventId);
    List<EventRegistration> findByUserId(String userId);
}
