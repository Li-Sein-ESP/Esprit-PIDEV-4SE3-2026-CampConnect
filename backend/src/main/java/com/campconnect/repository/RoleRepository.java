package com.campconnect.repository;

<<<<<<< HEAD
import com.campconnect.model.ERole;
import com.campconnect.model.Role;
=======
import com.campconnect.model.Role;

import com.campconnect.model.ERole;
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface RoleRepository extends MongoRepository<Role, String> {
	Optional<Role> findByName(ERole name);
}
