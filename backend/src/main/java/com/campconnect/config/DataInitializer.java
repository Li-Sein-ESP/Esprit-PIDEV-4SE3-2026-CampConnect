package com.campconnect.config;

import java.util.HashSet;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.campconnect.model.ERole;
import com.campconnect.model.Role;
import com.campconnect.model.User;
import com.campconnect.repository.RoleRepository;
import com.campconnect.repository.UserRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Override
    public void run(String... args) throws Exception {
        // Initialize Roles
        if (roleRepository.count() == 0) {
            roleRepository.save(new Role(ERole.ROLE_USER));
            roleRepository.save(new Role(ERole.ROLE_ADMIN));
        }

        // Initialize Users
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User("admin", "admin@campconnect.com", encoder.encode("admin123"), "Administrator");
            Set<Role> roles = new HashSet<>();
            Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            roles.add(adminRole);
            admin.setRoles(roles);
            userRepository.save(admin);
        }

        if (!userRepository.existsByUsername("camper")) {
            User camper = new User("camper", "camper@campconnect.com", encoder.encode("camper123"), "Happy Camper");
            Set<Role> roles = new HashSet<>();
            Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            roles.add(userRole);
            camper.setRoles(roles);
            userRepository.save(camper);
        }
    }
}
