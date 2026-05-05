package com.campconnect.scheduler;

import com.campconnect.model.Comment;
import com.campconnect.moderation.comment.CommentProfanitySupport;
import com.campconnect.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Les commentaires sont publiés tout de suite ; ce job (par défaut toutes les 1 min) parcourt la base,
 * supprime ceux qui contiennent des mots interdits et enregistre l’action dans {@code moderation_logs} (audit admin).
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class CommentCleanupScheduler {

    private final CommentRepository commentRepository;
    private final CommentProfanitySupport commentProfanitySupport;

    /**
     * Exécution périodique (démo jury : 1 min — ajuster en prod ex. 30 min).
     */
    @Scheduled(fixedRateString = "${moderation.comment.cleanup-interval-ms:60000}")
    public void cleanupImpoliteComments() {
        List<Comment> allComments = commentRepository.findAll();
        log.debug("[ROBOT-MODERATION] Scan planifié : {} commentaire(s).", allComments.size());

        int deletedCount = 0;

        for (Comment comment : allComments) {
            if (comment.getContent() == null || comment.getContent().isBlank()) {
                continue;
            }

            if (commentProfanitySupport.isProfane(comment.getContent())) {
                log.warn("[Moderation-Scheduler] Langage inapproprié : '{}' par {}",
                        comment.getContent(), comment.getAuthorName());

                commentProfanitySupport.recordProfanityBlockAndStrike(
                        comment.getAuthorId(),
                        comment.getAuthorUsername(),
                        comment.getId(),
                        comment.getPostId(),
                        comment.getContent(),
                        "SCHEDULED_CLEANUP"
                );

                commentRepository.delete(comment);
                deletedCount++;
            }
        }

        // Visible au niveau INFO pour confirmer que le job tourne (démo / débogage)
        log.info("[Moderation-Scheduler] Cycle terminé : {} commentaire(s) parcouru(s), {} suppression(s).",
                allComments.size(), deletedCount);
    }
}
