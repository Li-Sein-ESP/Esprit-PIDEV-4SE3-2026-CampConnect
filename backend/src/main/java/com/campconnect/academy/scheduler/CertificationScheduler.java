package com.campconnect.academy.scheduler;

import com.campconnect.academy.entity.UserCertification;
import com.campconnect.academy.repository.UserCertificationRepository;
import com.campconnect.enums.CertificationStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class CertificationScheduler {

    private final UserCertificationRepository userCertificationRepository;

    /**
     * Executes every day at midnight to check for expired certifications.
     * Business Logic: If a certification is older than 12 months, mark it as EXPIRED.
     */
    @Scheduled(cron = "0 0 0 * * *")
    public void checkExpiredCertifications() {
        log.info("Starting scheduled task: checkExpiredCertifications");
        
        List<UserCertification> activeCerts = userCertificationRepository.findByStatus(CertificationStatus.ACTIVE);
        LocalDateTime twelveMonthsAgo = LocalDateTime.now().minusMonths(12);
        
        int count = 0;
        for (UserCertification cert : activeCerts) {
            if (cert.getEarnedDate().isBefore(twelveMonthsAgo)) {
                cert.setStatus(CertificationStatus.EXPIRED);
                userCertificationRepository.save(cert);
                count++;
            }
        }
        
        log.info("Finished scheduled task. {} certifications were marked as EXPIRED.", count);
    }
}
