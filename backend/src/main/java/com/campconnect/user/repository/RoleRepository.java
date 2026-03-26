package com.campconnect.user.repository;

import com.campconnect.user.entity.ERole;
import com.campconnect.user.entity.Role;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface RoleRepository extends MongoRepository<Role, String> {
	Optional<Role> findByName(ERole name);
}
