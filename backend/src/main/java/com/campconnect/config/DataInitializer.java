package com.campconnect.config;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.campconnect.user.entity.ERole;
import com.campconnect.user.entity.Role;
import com.campconnect.user.entity.User;
import com.campconnect.user.repository.RoleRepository;
import com.campconnect.user.repository.UserRepository;
import com.campconnect.trip.entity.Trip;
import com.campconnect.trip.repository.TripRepository;
import com.campconnect.trip.enums.DifficultyLevel;
import com.campconnect.trip.enums.TripStatus;
import com.campconnect.transport.entity.Transport;
import com.campconnect.transport.repository.TransportRepository;
import com.campconnect.transport.enums.TransportMode;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    TripRepository tripRepository;

    @Autowired
    TransportRepository transportRepository;

    @Autowired
    PasswordEncoder encoder;

    @Override
    public void run(String... args) throws Exception {
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
        } else {
            User admin = userRepository.findByUsername("admin").get();
            admin.setPassword(encoder.encode("admin123"));
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

        // Initialize Sample Trip (to create the collection)
        if (tripRepository.count() == 0) {
            Trip sampleTrip = new Trip(
                    "First Adventure",
                    null,
                    Instant.now(),
                    Instant.now().plusSeconds(86400 * 3),
                    DifficultyLevel.MODERATE,
                    new BigDecimal("500.00"),
                    TripStatus.PLANNED);
            sampleTrip.setUserId("admin");
            tripRepository.save(sampleTrip);

            // Initialize Sample Transport
            if (transportRepository.count() == 0) {
                Transport sampleTransport = new Transport(
                        sampleTrip.getId(),
                        null,
                        TransportMode.CAR,
                        new BigDecimal("45.00"),
                        120,
                        "Private Car");
                transportRepository.save(sampleTransport);
            }
        }
    }
}
