package com.campconnect.repository;

import com.campconnect.model.Post;
import org.springframework.data.mongodb.repository.MongoRepository;
<<<<<<< HEAD
import org.springframework.stereotype.Repository;
=======
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)

@Repository
public interface PostRepository extends MongoRepository<Post, String> {
    void deleteByThreadId(String threadId);
<<<<<<< HEAD
=======
    
    @Query("{ 'threadId' : ?0 }")
    List<Post> findByThreadId(String threadId);
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
}
