package com.campconnect.repository;

import com.campconnect.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByUserIdAndReadOrderByCreatedAtDesc(String userId, boolean read);
    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);
}
