package com.campconnect.academy.repository;

import com.campconnect.academy.entity.Certification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CertificationRepository extends MongoRepository<Certification, String> {
    List<Certification> findByRequiredCoursesId(String courseId);

    /**
     * Requirement: Keyword-based query involving multiple fields (Multi-table search equivalent in NoSQL)
     * Search for certifications by name, description, or requirements using regex for flexible matching.
     */
    @org.springframework.data.mongodb.repository.Query("{ '$or': [ " +
            "{ 'name': { '$regex': ?0, '$options': 'i' } }, " +
            "{ 'description': { '$regex': ?0, '$options': 'i' } }, " +
            "{ 'requirements': { '$regex': ?0, '$options': 'i' } } " +
            "] }")
    List<Certification> searchByKeyword(String keyword);
}
