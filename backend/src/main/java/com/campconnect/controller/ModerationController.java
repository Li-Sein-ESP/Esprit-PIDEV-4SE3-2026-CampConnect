package com.campconnect.controller;

import com.campconnect.model.ModerationLog;
import com.campconnect.model.User;
import com.campconnect.repository.ModerationLogRepository;
import com.campconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/moderation")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class ModerationController {

    private final ModerationLogRepository moderationLogRepository;
    private final UserRepository userRepository;

    /**
     * RÈGLE 2 : Jointure Java entre ModerationLog + User.
     * On enrichit manuellement chaque log avec les données de l'utilisateur.
     */
    @GetMapping("/logs")
    public ResponseEntity<List<Map<String, Object>>> getModerationAuditLogs() {
        // 1. Récupérer tous les logs (simple findAll, toujours fiable)
        List<ModerationLog> rawLogs = moderationLogRepository.findAll();
        log.info("[ModerationController] Nombre de logs trouvés en BDD : {}", rawLogs.size());

        // 2. Enrichir chaque log avec les données User (la "jointure" côté Java)
        List<Map<String, Object>> enrichedLogs = new ArrayList<>();
        for (ModerationLog logEntry : rawLogs) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("id", logEntry.getId());
            entry.put("userId", logEntry.getUserId());
            entry.put("entityType", logEntry.getEntityType());
            entry.put("originalContent", logEntry.getOriginalContent());
            entry.put("reason", logEntry.getReason());
            entry.put("actionTaken", logEntry.getActionTaken());
            entry.put("createdAt", logEntry.getCreatedAt());

            // Jointure : on cherche l'utilisateur par son ID
            String username = logEntry.getUsername(); // fallback : username sauvegardé dans le log
            int strikeCount = 0;

            if (logEntry.getUserId() != null) {
                Optional<User> userOpt = userRepository.findById(logEntry.getUserId());
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    username = user.getUsername();
                    strikeCount = user.getBanCount();
                }
            }

            entry.put("username", username != null ? username : "Utilisateur Inconnu");
            entry.put("strikeCount", strikeCount);
            enrichedLogs.add(entry);
        }

        // Trier du plus récent au plus ancien
        enrichedLogs.sort((a, b) -> {
            if (a.get("createdAt") == null || b.get("createdAt") == null) return 0;
            return b.get("createdAt").toString().compareTo(a.get("createdAt").toString());
        });

        return ResponseEntity.ok(enrichedLogs);
    }

    @GetMapping("/logs/user/{userId}")
    public ResponseEntity<?> getUserLogs(@PathVariable String userId) {
        return ResponseEntity.ok(moderationLogRepository.findByUserIdOrderByCreatedAtDesc(userId));
    }
}
