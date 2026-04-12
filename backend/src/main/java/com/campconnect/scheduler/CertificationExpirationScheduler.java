package com.campconnect.scheduler;

import com.campconnect.academy.entity.UserCertification;
import com.campconnect.enums.CertificationStatus;
import com.campconnect.academy.repository.UserCertificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * TÂCHE 1 – @Scheduled updated to expire outdated certifications.
 *
 * This scheduler runs daily at 2:00 AM to check for any active certifications
 * that have passed their expiry date. It automatically updates their status
 * to EXPIRED in the database.
 */
@Component
public class CertificationExpirationScheduler {

    private static final Logger logger = LoggerFactory.getLogger(CertificationExpirationScheduler.class);

    @Autowired
    private UserCertificationRepository userCertificationRepository;

    @Scheduled(cron = "0 0 2 * * ?")
    public void expireOutdatedCertifications() {
        logger.info("[SCHEDULER] Starting Academy certification expiration check at {}", LocalDateTime.now());

        List<UserCertification> activeCertifications =
                userCertificationRepository.findByStatus(CertificationStatus.ACTIVE);

        int expiredCount = 0;

        for (UserCertification userCert : activeCertifications) {
            if (userCert.getExpiryDate() != null && userCert.getExpiryDate().isBefore(LocalDateTime.now())) {
                userCert.setStatus(CertificationStatus.EXPIRED);
                userCertificationRepository.save(userCert);
                expiredCount++;
                logger.info("[SCHEDULER] User Certification marked as EXPIRED: ID={} User={}",
                        userCert.getId(),
                        userCert.getUser() != null ? userCert.getUser().getUsername() : "unknown");
            }
        }

        logger.info("[SCHEDULER] Academy check completed. {} certifications expired.", expiredCount);
    }
}
