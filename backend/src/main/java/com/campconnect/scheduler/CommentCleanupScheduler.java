package com.campconnect.scheduler;

import com.campconnect.model.Comment;
import com.campconnect.model.ModerationLog;
import com.campconnect.model.User;
import com.campconnect.repository.CommentRepository;
import com.campconnect.repository.ModerationLogRepository;
import com.campconnect.repository.UserRepository;
import com.campconnect.service.EmailNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Component
@Slf4j
@RequiredArgsConstructor
public class CommentCleanupScheduler {

    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final ModerationLogRepository moderationLogRepository;
    private final EmailNotificationService emailNotificationService;

    // RÈGLE 3 : Liste de mots-clés interdits (Keywords)
    private static final List<String> BANNED_KEYWORDS = Arrays.asList(
            "idiot", "stupid", "hate", "damn", "trash", "impoli", "merde", "salopard", "con", "débile", "pute"
    );

    /**
     * RÈGLE 1 : Scheduler exécuté périodiquement (ex: toutes les 30 min).
     * Ici réglé à 60000ms (1 min) pour faciliter votre démonstration au jury.
     */
    @Scheduled(fixedRate = 60000) 
    public void cleanupImpoliteComments() {
        List<Comment> allComments = commentRepository.findAll();
        log.info("[ROBOT-MODERATION] Scan en cours... J'ai trouvé {} commentaires en base de données.", allComments.size());

        int deletedCount = 0;

        for (Comment comment : allComments) {
            if (comment.getContent() == null) continue;
            
            String content = comment.getContent().toLowerCase();
            
            // Logique de détection par mots-clés
            boolean containsBannedWord = BANNED_KEYWORDS.stream().anyMatch(content::contains);

            if (containsBannedWord) {
                log.warn("[Moderation] Commentaire inapproprié détecté : '{}' par {}", 
                         comment.getContent(), comment.getAuthorName());
                
                // 1. Sauvegarder dans l'Audit Log (Règle 2 : Alimentation de la jointure)
                ModerationLog mLog = ModerationLog.builder()
                        .userId(comment.getAuthorId())
                        .username(comment.getAuthorUsername())
                        .entityId(comment.getId())
                        .entityType("COMMENT")
                        .originalContent(comment.getContent())
                        .reason("PROFANITY_DETECTED")
                        .actionTaken("AUTO_DELETED")
                        .createdAt(LocalDateTime.now())
                        .build();
                moderationLogRepository.save(mLog);
                log.info("✅ [AUDIT-LOG] Entrée créée pour l'utilisateur {} dans moderation_logs", comment.getAuthorUsername());

                // 2. Appliquer le STRIKE SYSTEM sur l'utilisateur (Business Logic)
                updateUserStrike(comment.getAuthorId(), comment.getContent());

                // 3. Supprimer le commentaire (DB Update)
                commentRepository.delete(comment);
                deletedCount++;
            }
        }

        if (deletedCount > 0) {
            log.info("[Moderation-Scheduler] Nettoyage terminé. {} commentaires supprimés.", deletedCount);
        }
    }

    private void updateUserStrike(String userId, String badContent) {
        if (userId == null) return;
        
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            // Règle des Strikes : on incrémente le compteur
            int currentStrikes = user.getBanCount() + 1;
            user.setBanCount(currentStrikes);
            
            String status = "ACTIVE";
            String warningMsg = "Avertissement : Votre commentaire \"" + badContent + "\" a été supprimé. C'est votre " + currentStrikes + "er avertissement.";
            
            // Si l'utilisateur atteint 3 strikes, suppression DÉFINITIVE
            if (currentStrikes >= 3) {
                log.error("[MODERATION-CRITICAL] Suppression définitive de l'utilisateur {} pour récidive (3 strikes).", user.getUsername());
                
                // 1. Supprimer ses commentaires restants
                commentRepository.deleteByAuthorId(userId);
                
                // 2. Notifier par email une dernière fois
                emailNotificationService.sendBanNotification(
                    user.getEmail(), 
                    user.getUsername(), 
                    "SÉCURITÉ : Votre compte a été DÉFINITIVEMENT SUPPRIMÉ suite à 3 violations de nos règles de conduite. Toutes vos données ont été effacées."
                );

                // 3. Supprimer l'utilisateur de la base de données
                userRepository.deleteById(userId);
                return; // On s'arrête ici car l'utilisateur n'existe plus
            }

            Map<String, Object> details = user.getProfileDetails();
            if (details == null) details = new HashMap<>();
            
            details.put("moderationStatus", status);
            details.put("lastViolationDate", LocalDateTime.now().toString());
            details.put("strikeCount", currentStrikes);
            
            user.setProfileDetails(details);
            userRepository.save(user);
            
            // Notification proactive par Email
            emailNotificationService.sendBanNotification(user.getEmail(), user.getUsername(), warningMsg);
            log.info("[Moderation] Strike {} appliqué à {}. Nouveau statut: {}", currentStrikes, user.getUsername(), status);
        }
    }
}
