package com.campconnect.academy.repository;

import com.campconnect.academy.entity.UserCertification;
import com.campconnect.enums.CertificationStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Repository for UserCertification documents.
 *
 * Key Spring Data keyword methods:
 *  - findByUser_Id          → traverses @DBRef to User, filters by user ID
 *  - findByUser_IdAndStatus → TÂCHE 3: multi-entity keyword query (User @DBRef + CertificationStatus)
 *  - findByStatus           → used by the nightly @Scheduled task (TÂCHE 1)
 */
@Repository
public interface UserCertificationRepository extends MongoRepository<UserCertification, String> {
    List<UserCertification> findByUser_Id(String userId);
    List<UserCertification> findByCertificationId(String certificationId);
    List<UserCertification> findByStatus(CertificationStatus status);
    /** TÂCHE 3 – Keyword query traversing two entities: UserCertification + User (@DBRef) */
    List<UserCertification> findByUser_IdAndStatus(String userId, CertificationStatus status);
}
