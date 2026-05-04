package com.campconnect.academy.repository;

import com.campconnect.academy.entity.Certification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CertificationRepository extends MongoRepository<Certification, String> {
<<<<<<< HEAD
=======
    List<Certification> findByRequiredCoursesId(String courseId);
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
}
