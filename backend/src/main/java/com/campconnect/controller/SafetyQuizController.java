package com.campconnect.controller;

import com.campconnect.model.User;
import com.campconnect.repository.UserRepository;
import com.campconnect.service.EmailNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/community/safety")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SafetyQuizController {

    private final UserRepository userRepository;
    private final EmailNotificationService emailNotificationService;

    @PutMapping("/rehabilitate/{userId}")
    public ResponseEntity<?> rehabilitateUser(@PathVariable String userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();
        
        // On récupère les détails du profil
        Map<String, Object> profileDetails = user.getProfileDetails();
        if (profileDetails == null) {
            profileDetails = new HashMap<>();
        }

        // 🚫 VÉRIFICATION : Ban définitif = aucune réhabilitation possible
        if ("PERMANENTLY_BANNED".equals(profileDetails.get("moderationStatus"))) {
            // Supprimer définitivement le compte
            userRepository.deleteById(userId);
            return ResponseEntity.status(403).body(Map.of(
                "message", "Votre compte a été supprimé définitivement suite à des récidives. Aucune réactivation n'est possible.",
                "status", "PERMANENTLY_DELETED"
            ));
        }

        // On vérifie s'il est vraiment banni (1er écart)
        if (!"BANNED".equals(profileDetails.get("moderationStatus"))) {
            return ResponseEntity.badRequest().body(Map.of(
                "message", "L'utilisateur n'est pas banni.",
                "status", "NOT_BANNED"
            ));
        }

        // 🔄 RÉHABILITATION (unique chance)
        profileDetails.put("moderationStatus", "ACTIVE");
        profileDetails.put("rehabilitatedAt", java.time.LocalDateTime.now().toString());
        profileDetails.put("trustScore", 50.0); // Reset à 50%
        
        user.setProfileDetails(profileDetails);
        userRepository.save(user);

        // 📧 Envoi de l'email de confirmation
        emailNotificationService.sendRehabilitationSuccessEmail(user.getEmail(), user.getUsername());

        return ResponseEntity.ok(Map.of(
            "message", "Félicitations ! Votre compte a été réactivé. Attention : en cas de récidive, votre compte sera supprimé définitivement.",
            "status", "ACTIVE"
        ));
    }

    @DeleteMapping("/purge/{userId}")
    public ResponseEntity<?> purgeAccount(@PathVariable String userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            Map<String, Object> details = user.getProfileDetails();
            if (details != null && "PERMANENTLY_BANNED".equals(details.get("moderationStatus"))) {
                userRepository.deleteById(userId);
                return ResponseEntity.ok(Map.of("message", "Compte supprimé réellement de la BDD."));
            }
        }
        return ResponseEntity.badRequest().body("Action non autorisée.");
    }
}
