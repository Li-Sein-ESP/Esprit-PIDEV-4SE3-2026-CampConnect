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
        if (roleRepository.count() == 0) {
            roleRepository.save(new Role(ERole.ROLE_USER));
            roleRepository.save(new Role(ERole.ROLE_ADMIN));
        }

        // 2. Initialize Users
        User admin = userRepository.findByUsername("admin").orElse(null);
        if (admin == null) {
            admin = new User("admin", "admin@campconnect.com", encoder.encode("admin123"), "Administrator");
            Set<Role> roles = new HashSet<>();
            roles.add(roleRepository.findByName(ERole.ROLE_ADMIN).get());
            admin.setRoles(roles);
            admin = userRepository.save(admin);
        }

        User camper = userRepository.findByUsername("camper").orElse(null);
        if (camper == null) {
            camper = new User("camper", "camper@campconnect.com", encoder.encode("camper123"), "Happy Camper");
            Set<Role> roles = new HashSet<>();
            roles.add(roleRepository.findByName(ERole.ROLE_USER).get());
            camper.setRoles(roles);
            camper = userRepository.save(camper);
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

            group.getTrips().add(trip);
            groupRepository.save(group);

            // 4. Initialize Incidents & Safety Alerts
            Incident incident = new Incident();
            incident.setTitle("Sentier bloqué");
            incident.setDescription("Un arbre est tombé sur le sentier principal");
            incident.setTrip(trip);
            incidentRepository.save(incident);

            SafetyAlert alert = new SafetyAlert();
            alert.setMessage("Risque d'orage prévu pour demain");
            alert.setSeverity(AlertSeverity.DANGER);
            alert.setTrip(trip);
            safetyAlertRepository.save(alert);
        }

        // 5. Initialize Forum, Posts & Comments
        if (forumThreadRepository.count() == 0) {
            ForumThread thread = new ForumThread();
            thread.setTitle("Conseils pour débutants");
            thread.setDescription("Partagez vos astuces pour les premiers campings");
            thread.setAuthor(admin);
            thread = forumThreadRepository.save(thread);

            Post post = new Post();
            post.setContent("N'oubliez pas d'apporter une lampe frontale !");
            post.setAuthor(camper);
            post.setThread(thread);
            post = postRepository.save(post);

            thread.getPosts().add(post);
            forumThreadRepository.save(thread);

            Comment comment = new Comment();
            comment.setContent("Très bon conseil, merci !");
            comment.setAuthor(admin);
            comment.setPost(post);
            commentRepository.save(comment);

            post.getComments().add(comment);
            postRepository.save(post);
        }

        System.out.println(">> Database fully initialized with sample data!");
    }
}
