package com.campconnect.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;

/**
 * Service pour interagir avec le microservice Python d'Intelligence Artificielle.
 */
@Service
public class AiIntegrationService {

    private final RestTemplate restTemplate;
    private final String AI_API_BASE_URL = "http://localhost:5000/api/ai";

    public AiIntegrationService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Appelle l'API Python pour prédire la popularité d'un événement (nombre d'inscrits attendus).
     */
    public Map<String, Object> predictEventPopularity(int categoryId, int capacity, int durationDays, String difficulty, String season) {
        try {
            String url = AI_API_BASE_URL + "/event/predict-popularity";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("category_id", categoryId);
            requestBody.put("capacity", capacity);
            requestBody.put("duration_days", durationDays);
            requestBody.put("difficulty", difficulty);
            requestBody.put("season", season);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            return (Map<String, Object>) response.getBody();
        } catch (Exception e) {
            System.err.println("[IA] Erreur lors de l'appel à l'IA de Popularity: " + e.getMessage());
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("status", "error");
            fallback.put("expected_attendees", capacity > 0 ? (int)(capacity * 0.5) : 0);
            fallback.put("capacity", capacity);
            fallback.put("fill_rate_percentage", 50.0);
            return fallback;
        }
    }

    /**
     * Appelle l'API Python pour recommander des événements basés sur les préférences de l'utilisateur.
     */
    public List<Map<String, Object>> getEventRecommendations(String preferences, List<String> history, List<Map<String, Object>> events) {
        try {
            String url = AI_API_BASE_URL + "/event/recommend";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("user_preferences", preferences);
            requestBody.put("user_history", history != null ? history : new ArrayList<>());
            requestBody.put("events", events);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            if (response.getBody() != null && response.getBody().containsKey("recommendations")) {
                return (List<Map<String, Object>>) response.getBody().get("recommendations");
            }
        } catch (Exception e) {
            System.err.println("[IA] Erreur lors de l'appel à l'IA de Recommandation: " + e.getMessage());
        }
        return new ArrayList<>(); // Return empty list on error
    }



    /**
     * Appelle l'IA pour prédire la catégorie textuelle d'un événement depuis sa description using NLP.
     * Le professeur a demandé: Encodage 0-1-2 -> 0: Hiking, 1: Workshop, 2: Campfire
     */
    public Map<String, Object> predictEventCategory(String description) {
        try {
            String url = AI_API_BASE_URL + "/event/predict-category";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("description", description);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            return (Map<String, Object>) response.getBody();
        } catch (Exception e) {
            System.err.println("[IA] Erreur prediction categorie d'événement NLP: " + e.getMessage());
            
            // Fallback robuste exigé en cas de coupure de l'API
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("status", "error");
            fallback.put("categoryId", 0);
            fallback.put("categoryName", "Hiking");
            fallback.put("confidenceScore", 50.0);
            fallback.put("message", "Fallback: API Python injoignable, catégorie par défaut.");
            return fallback;
        }
    }

    /**
     * Appelle l'API Python pour générer un quiz adapté au contenu du cours.
     */
    public Map<String, Object> generateQuizForCourse(String topic, String description) {
        try {
            String url = AI_API_BASE_URL + "/quiz/generate";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("topic", topic != null ? topic : "");
            requestBody.put("description", description != null ? description : "");
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            return (Map<String, Object>) response.getBody();
        } catch (Exception e) {
            System.err.println("[IA] Erreur lors de la génération du quiz: " + e.getMessage());
            return null;
        }
    }

    /**
     * Appelle l'API Python pour générer une liste de préparation intelligente.
     */
    public Map<String, Object> generatePackingList(String eventType, String difficulty, String season) {
        try {
            String url = AI_API_BASE_URL + "/events/packing-list";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("event_type", eventType);
            requestBody.put("difficulty", difficulty);
            requestBody.put("season", season);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            return (Map<String, Object>) response.getBody();
        } catch (Exception e) {
            System.err.println("[IA] Erreur génération Packing List: " + e.getMessage());
            return null;
        }
    }

    /**
     * Appelle l'API Python pour prédire les ODD (SDGs) et le score de durabilité.
     */
    public Map<String, Object> predictEventOdd(String title, String description) {
        try {
            String url = AI_API_BASE_URL + "/event/predict-odd";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("title", title != null ? title : "");
            requestBody.put("description", description != null ? description : "");
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            return (Map<String, Object>) response.getBody();
        } catch (Exception e) {
            System.err.println("[IA] Erreur prediction ODD: " + e.getMessage());
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("status", "error");
            fallback.put("sdgs", java.util.List.of("SDG 15 : Vie terrestre"));
            fallback.put("sustainability_score", 50);
            return fallback;
        }
    }
}
