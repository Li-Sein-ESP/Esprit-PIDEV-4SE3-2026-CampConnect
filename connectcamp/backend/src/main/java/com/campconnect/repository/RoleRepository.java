package com.campconnect.repository;

import com.campconnect.model.Role;

import com.campconnect.model.ERole;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface RoleRepository extends MongoRepository<Role, String> {
	Optional<Role> findByName(ERole name);
}
