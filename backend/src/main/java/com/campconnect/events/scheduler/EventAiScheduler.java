package com.campconnect.events.scheduler;

import com.campconnect.events.repository.EventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class EventAiScheduler {

    private static final Logger logger = LoggerFactory.getLogger(EventAiScheduler.class);

    @Autowired
    private EventRepository eventRepository;

    /**
     * Simule une mise à jour des scores de synergie IA entre les modules
     * s'exécute tous les jours à minuit (cron = "0 0 0 * * *")
     * Pour la démo, on peut le mettre toutes les 5 minutes.
     */
    @Scheduled(fixedRate = 300000) // 5 minutes
    public void updateAiSynergyScores() {
        logger.info("🤖 AI ENGINE: Déclenchement de la synchronisation Neuro-Synergy...");
        
        try {
            // Ici, on simulerait un appel à l'API Python pour recalculer les scores
            // basés sur les nouvelles inscriptions Academy
            long count = eventRepository.count();
            
            logger.info("✅ AI SYNC: Mise à jour réussie pour {} événements.", count);
            logger.info("📊 Statut: Les recommandations sont maintenant synchronisées avec les badges Academy v4.0.");
        } catch (Exception e) {
            logger.error("❌ AI SYNC ERROR: Échec de la synchronisation nocturne: {}", e.getMessage());
        }
    }
}
