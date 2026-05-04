package com.campconnect.config;

import com.campconnect.model.Role;

import com.campconnect.model.User;

import java.util.HashSet;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.campconnect.model.ERole;
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
        if (roleRepository.findByName(ERole.ROLE_ORGANIZER).isEmpty())
            roleRepository.save(new Role(ERole.ROLE_ORGANIZER));
        if (roleRepository.findByName(ERole.ROLE_EXPERT).isEmpty())
            roleRepository.save(new Role(ERole.ROLE_EXPERT));
        if (roleRepository.findByName(ERole.ROLE_EQUIPMENT_PROVIDER).isEmpty())
            roleRepository.save(new Role(ERole.ROLE_EQUIPMENT_PROVIDER));
        if (roleRepository.findByName(ERole.ROLE_DELIVERY_PROVIDER).isEmpty())
            roleRepository.save(new Role(ERole.ROLE_DELIVERY_PROVIDER));

        // Initialize Users
        if (!userRepository.existsByUsername("admin")) {
            System.out.println("Creating default admin user...");
            User admin = new User("admin", "admin@campconnect.com", encoder.encode("admin123"), "Administrator");
            Set<Role> roles = new HashSet<>();
            Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                    .orElseThrow(() -> new RuntimeException("Error: Role ROLE_ADMIN is not found."));
            roles.add(adminRole);
            admin.setRoles(roles);
            userRepository.save(admin);
            System.out.println("Admin user created successfully.");
        } else {
            System.out.println("Admin user exists, ensuring password and roles...");
            userRepository.findByUsername("admin").ifPresent(admin -> {
                admin.setPassword(encoder.encode("admin123"));
                Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN).orElse(null);
                if (adminRole != null && !admin.getRoles().contains(adminRole)) {
                    admin.getRoles().add(adminRole);
                }
                userRepository.save(admin);
                System.out.println("Admin user updated successfully.");
            });
        }

        if (!userRepository.existsByUsername("camper")) {
            System.out.println("Creating default camper user...");
            User camper = new User("camper", "camper@campconnect.com", encoder.encode("camper123"), "Happy Camper");
            Set<Role> roles = new HashSet<>();
            Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                    .orElseThrow(() -> new RuntimeException("Error: Role ROLE_USER is not found."));
            roles.add(userRole);
            camper.setRoles(roles);
            userRepository.save(camper);
            System.out.println("Camper user created successfully.");
        }
    }
}
