package com.campconnect.academy.repository;

import com.campconnect.academy.entity.UserCertification;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

<<<<<<< HEAD
public interface UserCertificationRepository extends MongoRepository<UserCertification, String> {
    List<UserCertification> findByUserId(String userId);
    List<UserCertification> findByCertificationId(String certificationId);
=======
import com.campconnect.enums.CertificationStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface UserCertificationRepository extends MongoRepository<UserCertification, String> {
    List<UserCertification> findByUserId(String userId);
    List<UserCertification> findByCertificationId(String certificationId);
    List<UserCertification> findByStatus(CertificationStatus status);
    List<UserCertification> findByUser_IdAndStatus(String userId, CertificationStatus status);
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
}
