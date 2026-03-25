package com.campconnect.repository;

import com.campconnect.entity.Certification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CertificationRepository extends MongoRepository<Certification, String> {
}
