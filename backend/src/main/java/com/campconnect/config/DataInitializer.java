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
        // Initialize Roles
        if (roleRepository.findByName(ERole.ROLE_USER).isEmpty())
            roleRepository.save(new Role(ERole.ROLE_USER));
        if (roleRepository.findByName(ERole.ROLE_ADMIN).isEmpty())
            roleRepository.save(new Role(ERole.ROLE_ADMIN));
        if (roleRepository.findByName(ERole.ROLE_CAMPER).isEmpty())
            roleRepository.save(new Role(ERole.ROLE_CAMPER));
        if (roleRepository.findByName(ERole.ROLE_SITE_OWNER).isEmpty())
            roleRepository.save(new Role(ERole.ROLE_SITE_OWNER));
        if (roleRepository.findByName(ERole.ROLE_EQUIPMENT_PROVIDER).isEmpty())
            roleRepository.save(new Role(ERole.ROLE_EQUIPMENT_PROVIDER));
        if (roleRepository.findByName(ERole.ROLE_ORGANIZER).isEmpty())
            roleRepository.save(new Role(ERole.ROLE_ORGANIZER));
        if (roleRepository.findByName(ERole.ROLE_DELIVERY_PROVIDER).isEmpty())
            roleRepository.save(new Role(ERole.ROLE_DELIVERY_PROVIDER));

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
            Role camperRole = roleRepository.findByName(ERole.ROLE_CAMPER)
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            roles.add(camperRole);
            camper.setRoles(roles);
            userRepository.save(camper);
        }
    }
}
