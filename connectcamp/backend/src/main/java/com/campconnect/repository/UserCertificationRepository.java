package com.campconnect.repository;

import com.campconnect.entity.UserCertification;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface UserCertificationRepository extends MongoRepository<UserCertification, String> {
    List<UserCertification> findByUserId(String userId);
    List<UserCertification> findByCertificationId(String certificationId);
}
