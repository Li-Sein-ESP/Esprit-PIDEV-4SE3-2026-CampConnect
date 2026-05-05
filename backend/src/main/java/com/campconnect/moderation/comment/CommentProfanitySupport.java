package com.campconnect.moderation.comment;

import com.campconnect.model.ModerationLog;
import com.campconnect.model.User;
import com.campconnect.repository.CommentRepository;
import com.campconnect.repository.ModerationLogRepository;
import com.campconnect.repository.UserRepository;
import com.campconnect.service.EmailNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Détection de mots grossiers (liste partagée avec le scheduler) + audit {@code moderation_logs} + strikes.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CommentProfanitySupport {

    private final ModerationLogRepository moderationLogRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final EmailNotificationService emailNotificationService;

    @Value("${moderation.comment.banned-keywords:}")
    private String bannedKeywordsConfig;

    /** Sous-chaînes (minuscules) — ajouter via {@code moderation.comment.banned-keywords} pour surcharge. */
    private static final List<String> DEFAULT_BANNED = Arrays.asList(
            // FR courant
            "putain", "putain de", "merde", "salope", "salopard", "connard", "connasse", "conne",
            "enculé", "enculer", "fdp", "fils de pute", "ta mère", "bite",
            "couillon", "débile", "crétin", "imbécile", "bordel", "batard", "salaud",
            // EN / mixte
            "idiot", "stupid", "hate", "damn", "trash", "impoli", "pute", "nazi",
            "fuck", "shit", "asshole", "bitch", "dick", "cunt"
    );

    public List<String> resolveBannedKeywords() {
        if (bannedKeywordsConfig != null && !bannedKeywordsConfig.isBlank()) {
            return Arrays.stream(bannedKeywordsConfig.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .map(s -> s.toLowerCase(Locale.ROOT))
                    .collect(Collectors.toList());
        }
        return DEFAULT_BANNED;
    }

    /** Retourne les termes interdits trouvés dans le texte (sous-chaîne, comme le scheduler). */
    public List<String> findMatchedTerms(String content) {
        if (content == null || content.isBlank()) {
            return List.of();
        }
        String lower = content.toLowerCase(Locale.ROOT);
        List<String> keywords = resolveBannedKeywords();
        List<String> hits = new ArrayList<>();
        for (String kw : keywords) {
            if (kw.length() >= 2 && lower.contains(kw)) {
                hits.add(kw);
            }
        }
        return hits;
    }

    public boolean isProfane(String content) {
        return !findMatchedTerms(content).isEmpty();
    }

    /**
     * Enregistre l'audit admin + applique la même logique de strikes / email que le nettoyage planifié.
     *
     * @param entityId id Mongo du commentaire supprimé (ou identifiant de traçage)
     */
    public void recordProfanityBlockAndStrike(
            String authorId,
            String authorUsername,
            String entityId,
            String postId,
            String originalContent,
            String detectionPhase
    ) {
        ModerationLog mLog = ModerationLog.builder()
                .userId(authorId)
                .username(authorUsername != null ? authorUsername : "")
                .entityId(entityId != null ? entityId : ("post:" + postId))
                .entityType("COMMENT")
                .originalContent(originalContent)
                .reason("PROFANITY_DETECTED")
                .actionTaken("AUTO_BLOCKED_" + detectionPhase)
                .createdAt(LocalDateTime.now())
                .build();
        moderationLogRepository.save(mLog);
        log.info("[CommentProfanity] Audit log créé ({}) pour user {}", detectionPhase, authorUsername);

        updateUserStrike(authorId, originalContent);
    }

    /** Comportement aligné sur le nettoyage planifié des commentaires. */
    private void updateUserStrike(String userId, String badContent) {
        if (userId == null) {
            return;
        }

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return;
        }

        User user = userOpt.get();

        int currentStrikes = user.getBanCount() + 1;
        user.setBanCount(currentStrikes);

        String status = "ACTIVE";
        String warningMsg = "Avertissement : votre message a été refusé ou supprimé (langage inapproprié). "
                + "C'est votre " + currentStrikes + "er avertissement.";

        if (currentStrikes >= 3) {
            log.error("[MODERATION-CRITICAL] Suppression définitive de l'utilisateur {} pour récidive (3 strikes).", user.getUsername());

            commentRepository.deleteByAuthorId(userId);

            emailNotificationService.sendBanNotification(
                    user.getEmail(),
                    user.getUsername(),
                    "SÉCURITÉ : Votre compte a été DÉFINITIVEMENT SUPPRIMÉ suite à 3 violations de nos règles de conduite."
            );

            userRepository.deleteById(userId);
            return;
        }

        Map<String, Object> details = user.getProfileDetails();
        if (details == null) {
            details = new HashMap<>();
        } else {
            details = new HashMap<>(details);
        }

        details.put("moderationStatus", status);
        details.put("lastViolationDate", LocalDateTime.now().toString());
        details.put("strikeCount", currentStrikes);

        user.setProfileDetails(details);
        userRepository.save(user);

        emailNotificationService.sendBanNotification(user.getEmail(), user.getUsername(), warningMsg);
        log.info("[Moderation] Strike {} appliqué à {}.", currentStrikes, user.getUsername());
    }
}
