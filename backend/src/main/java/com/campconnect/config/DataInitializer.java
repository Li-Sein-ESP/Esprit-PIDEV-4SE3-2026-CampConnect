package com.campconnect.config;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.campconnect.model.*;
import com.campconnect.repository.*;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired RoleRepository roleRepository;
    @Autowired UserRepository userRepository;
    @Autowired TripRepository tripRepository;
    @Autowired GroupRepository groupRepository;
    @Autowired ForumThreadRepository forumThreadRepository;
    @Autowired PostRepository postRepository;
    @Autowired CommentRepository commentRepository;
    @Autowired IncidentRepository incidentRepository;
    @Autowired SafetyAlertRepository safetyAlertRepository;
    @Autowired PasswordEncoder encoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Initialize Roles
        if (roleRepository.findByName(ERole.ROLE_USER).isEmpty()) {
            roleRepository.save(new Role(ERole.ROLE_USER));
        }
        if (roleRepository.findByName(ERole.ROLE_ADMIN).isEmpty()) {
            roleRepository.save(new Role(ERole.ROLE_ADMIN));
        }

        // 2. Initialize Users
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User("admin", "admin@campconnect.com", encoder.encode("admin123"), "Administrator");
            Set<Role> roles = new HashSet<>();
            roles.add(roleRepository.findByName(ERole.ROLE_ADMIN)
                    .orElseThrow(() -> new RuntimeException("Error: Role ADMIN not found")));
            admin.setRoles(roles);
            userRepository.save(admin);
        }

        if (!userRepository.existsByUsername("camper")) {
            User camper = new User("camper", "camper@campconnect.com", encoder.encode("camper123"), "Happy Camper");
            Set<Role> roles = new HashSet<>();
            roles.add(roleRepository.findByName(ERole.ROLE_USER)
                    .orElseThrow(() -> new RuntimeException("Error: Role USER not found")));
            camper.setRoles(roles);
            userRepository.save(camper);
        }

        // 3. Initialize Groups & Trips
        if (groupRepository.count() == 0) {
            Group group = new Group();
            group.setName("Les Aventuriers");
            group.setDescription("Groupe pour les passionnés de randonnée");
            group = groupRepository.save(group);

            Trip trip = new Trip();
            trip.setDestination("Parc National de l'Ichkeul");
            trip.setStartDate(LocalDateTime.now().plusDays(7));
            trip.setEndDate(LocalDateTime.now().plusDays(10));
            trip.setDifficulty(DifficultyLevel.MEDIUM);
            trip.setGroup(group);
            trip = tripRepository.save(trip);
        }

        // 4. Initialize Incidents & Safety Alerts
        safetyAlertRepository.deleteAll();
        incidentRepository.deleteAll();
        
        Trip existingTrip = tripRepository.findAll().stream().findFirst().orElse(null);
        if (existingTrip != null) {
            Incident incident = new Incident();
            incident.setTitle("Sentier bloqué");
            incident.setDescription("Un arbre est tombé sur le sentier principal");
            incident.setTrip(existingTrip);
            incidentRepository.save(incident);

            SafetyAlert alert = new SafetyAlert();
            alert.setTitle("Risque d'orage");
            alert.setDescription("Risque d'orage prévu pour demain sur le sentier principal.");
            alert.setType("WEATHER");
            alert.setSeverity(AlertSeverity.DANGER);
            alert.setLocationName("Parc National de l'Ichkeul");
            alert.setRegionName("Bizerte");
            alert.setTrip(existingTrip);
            safetyAlertRepository.save(alert);
            
            SafetyAlert alert2 = new SafetyAlert();
            alert2.setTitle("Incendie de forêt");
            alert2.setDescription("Un incendie s'est déclaré près de la zone de camping C.");
            alert2.setType("FIRE");
            alert2.setSeverity(AlertSeverity.CRITICAL);
            alert2.setLocationName("Forêt d'Ain Draham");
            alert2.setRegionName("Jendouba");
            alert2.setTrip(existingTrip);
            safetyAlertRepository.save(alert2);
        }

        // 5. Initialize Forum, Posts & Comments
        if (forumThreadRepository.count() == 0) {
            User adminUser = userRepository.findByUsername("admin").orElse(null);
            User camperUser = userRepository.findByUsername("camper").orElse(null);

            ForumThread gearThread = new ForumThread();
            gearThread.setTitle("Meilleures tentes 4 saisons");
            gearThread.setDescription("Quelles sont vos recommandations pour le camping d'hiver ?");
            gearThread.setAuthor(adminUser);
            gearThread.setCategory("Gear & Equipment");
            forumThreadRepository.save(gearThread);

            ForumThread thread = new ForumThread();
            thread.setTitle("Conseils pour débutants");
            thread.setDescription("Partagez vos astuces pour les premiers campings");
            thread.setAuthor(adminUser);
            thread.setCategory("General");
            thread = forumThreadRepository.save(thread);

            Post post = new Post();
            post.setContent("N'oubliez pas d'apporter une lampe frontale !");
            post.setAuthor(camperUser);
            post.setThread(thread);
            post = postRepository.save(post);

            thread.getPosts().add(post);
            forumThreadRepository.save(thread);

            Comment comment = new Comment();
            comment.setContent("Très bon conseil, merci !");
            comment.setAuthor(adminUser);
            comment.setPost(post);
            commentRepository.save(comment);

            post.getComments().add(comment);
            postRepository.save(post);
        }

        System.out.println(">> Database fully initialized with sample data!");
    }
}
