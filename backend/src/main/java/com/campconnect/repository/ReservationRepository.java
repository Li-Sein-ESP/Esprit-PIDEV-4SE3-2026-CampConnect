package com.campconnect.repository;

import com.campconnect.model.Reservation;
import com.campconnect.model.ReservationStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
<<<<<<< HEAD

=======
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
import java.util.List;

@Repository
public interface ReservationRepository extends MongoRepository<Reservation, String> {
    List<Reservation> findByUserId(String userId);
<<<<<<< HEAD

    List<Reservation> findByTargetId(String targetId);

=======
    List<Reservation> findByTargetId(String targetId);
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
    long countByUserIdAndStatus(String userId, ReservationStatus status);
}
