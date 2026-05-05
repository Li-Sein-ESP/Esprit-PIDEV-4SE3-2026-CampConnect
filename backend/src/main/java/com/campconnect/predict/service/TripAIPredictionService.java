package com.campconnect.predict.service;

import com.campconnect.predict.dto.ItineraryOptionDto;
import com.campconnect.predict.dto.TripPredictionResponse;
import com.campconnect.predict.dto.ItineraryOptionsResponse;
import com.campconnect.predict.dto.ItineraryBudgetPredictRequest;
import com.campconnect.predict.dto.ItineraryBudgetPredictionResponse;
import com.campconnect.predict.dto.ItineraryBudgetBreakdownDto;
import com.campconnect.predict.dto.ItineraryActivityDto;
import com.campconnect.predict.dto.ItineraryDayDto;
import com.campconnect.trip.entity.Trip;
import com.campconnect.trip.enums.DifficultyLevel;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.time.Duration;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Locale;
import java.util.HashSet;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Orchestrateur de Prédiction - Version PURE PYTHON / MACHINE LEARNING.
 * Ce service appelle exclusivement le micro-service Python pour toutes les analyses d'IA.
 */
@Service
@Slf4j
public class TripAIPredictionService {

    private final ObjectMapper objectMapper;
    private final OpenAIService openAiService;
    private final RestTemplate restTemplate;
    private final String aiServiceBaseUrl;

    public TripAIPredictionService(
            ObjectMapper objectMapper,
            OpenAIService openAiService,
            @Qualifier("campconnectAiRestTemplate") RestTemplate restTemplate,
            @Value("${campconnect.ai-service.base-url:http://localhost:5050}") String aiServiceBaseUrl
    ) {
        this.objectMapper = objectMapper;
        this.openAiService = openAiService;
        this.restTemplate = restTemplate;
        this.aiServiceBaseUrl = normalizeAiBaseUrl(aiServiceBaseUrl);
    }

    private static String normalizeAiBaseUrl(String url) {
        if (url == null || url.isBlank()) {
            return "http://localhost:5050";
        }
        return url.trim().replaceAll("/+$", "");
    }

    private String aiEndpoint(String path) {
        String p = path.startsWith("/") ? path : "/" + path;
        return aiServiceBaseUrl + p;
    }

    /**
     * Appelle le modèle Machine Learning (Python/FastAPI) pour obtenir les metrics.
     */
    public TripPredictionResponse predictTripMetrics(Trip trip) {
        try {
            // Préparation des Features pour le modèle ML
            Map<String, Object> features = new HashMap<>();
            features.put("duration_days", getDuration(trip));
            features.put("group_size", trip.getParticipants() > 0 ? trip.getParticipants() : 2);
            features.put("user_proposed_budget", trip.getTotalBudget() != null ? trip.getTotalBudget() : new BigDecimal(500));
            
            // Mapping du niveau de confort vers hotel_quality (1-5)
            int hotelQuality = 3;
            if (trip.getComfortLevel() != null) {
                String comfort = trip.getComfortLevel().toUpperCase();
                if (comfort.contains("LUXURY")) hotelQuality = 5;
                else if (comfort.contains("COMFORTABLE")) hotelQuality = 4;
                else if (comfort.contains("BASIC")) hotelQuality = 2;
                else if (comfort.contains("MINIMAL")) hotelQuality = 1;
            }
            features.put("hotel_quality", hotelQuality);

            // Mapping de la difficulté vers trip_type
            int tripType = 1; // Beach/Nature par défaut
            if (trip.getDifficulty() != null) {
                if (trip.getDifficulty() == DifficultyLevel.HARD) tripType = 5; // Adventure
                else if (trip.getDifficulty() == DifficultyLevel.MODERATE) tripType = 2; // Mountain
            }
            features.put("trip_type", tripType);

            features.put("paid_activities_count", trip.getActivities() != null ? trip.getActivities().size() : 0);
            features.put("has_paid_activities", (trip.getActivities() != null && !trip.getActivities().isEmpty()) ? 1 : 0);

            // Features enrichies pour alignement avec le scaler ML (région, saison du voyage, distance typique)
            features.put("location_name", extractRegion(trip));
            features.put("season_name", extractSeasonForTrip(trip));
            features.put("distance_km", estimateDistanceKm(trip));
            
            log.info("Appel FastAPI AI avec {} jours, {} participants, budget {} DT...", 
                getDuration(trip), trip.getParticipants(), trip.getTotalBudget());
            
            ResponseEntity<Map> response = restTemplate.postForEntity(aiEndpoint("/predict"), features, Map.class);
            
            Map<String, Object> body = (Map<String, Object>) response.getBody();
            Map<String, Object> predictions = (Map<String, Object>) body.get("predictions");
            
            return TripPredictionResponse.builder()
                    .predictedBudget(new BigDecimal(predictions.get("predicted_budget_tnd").toString()))
                    .cancellationProbability((Double) predictions.get("cancellation_probability"))
                    .budgetAdvice((String) predictions.get("budget_advice"))
                    .cancellationAdvice((String) predictions.get("risk_advice"))
                    .tripStyleSummary("Analyse Intelligence Artificielle (FastAPI / RandomForest)")
                    .build();

        } catch (Exception e) {
            log.error("Erreur critique : Le service FastAPI AI n'est pas lancé. {}", e.getMessage());
            return TripPredictionResponse.builder()
                    .budgetAdvice("ERREUR : Le serveur AI (FastAPI) est hors ligne.")
                    .cancellationAdvice("Veuillez lancer python app.py dans le dossier ai_service.")
                    .build();
        }
    }

    public String generateItinerary(Trip trip) {
        try {
            // TENTATIVE 1 : Utiliser le service Python ML local (Recommandé)
            log.info("Tentative de génération d'itinéraire via le service Python ML local...");
            ItineraryOptionsResponse pythonOptions = generateThreeItineraryOptions(trip, null);
            
            if (pythonOptions != null && "success".equals(pythonOptions.getStatus()) && !pythonOptions.getPrograms().isEmpty()) {
                // On choisit le programme "Medium" par défaut pour l'itinéraire simple
                ItineraryOptionDto selectedProgram = pythonOptions.getPrograms().stream()
                        .filter(p -> "medium".equalsIgnoreCase(p.getBudgetLevel()))
                        .findFirst()
                        .orElse(pythonOptions.getPrograms().get(0));
                
                log.info("Itinéraire généré avec succès via Python ML (Option: {})", selectedProgram.getTitle());
                return objectMapper.writeValueAsString(selectedProgram.getDays());
            }
            
            // TENTATIVE 2 : Fallback vers Gemini (si configuré)
            log.warn("Le service Python n'a pas renvoyé de programme valide, essai avec Gemini...");
            return generateItineraryWithGemini(trip);

        } catch (Exception e) {
            log.error("Échec de la génération d'itinéraire (Python & Gemini), utilisation du secours local : {}", e.getMessage());
            return generateLocalFallbackItinerary(trip, getDuration(trip));
        }
    }

    /**
     * Logique originale utilisant Gemini (OpenAI Service)
     */
    private String generateItineraryWithGemini(Trip trip) throws Exception {
        long duration = getDuration(trip);
        java.util.List<String> selectedActivities = trip.getActivities() != null ? trip.getActivities() : new java.util.ArrayList<>();
        int participants = trip.getParticipants() > 0 ? trip.getParticipants() : 1;
        BigDecimal totalBudget = trip.getTotalBudget() != null ? trip.getTotalBudget() : BigDecimal.ZERO;
        BigDecimal budgetPerPerson = totalBudget.divide(BigDecimal.valueOf(participants), 2, java.math.RoundingMode.HALF_UP);
        String destinationAddress = (trip.getDestination() != null && trip.getDestination().getAddress() != null)
                ? trip.getDestination().getAddress() : "";
        String tripTitle = trip.getTitle() != null ? trip.getTitle() : "";
        String destination = (!destinationAddress.isEmpty()) ? destinationAddress : (!tripTitle.isEmpty() ? tripTitle : "Tunisie (nature)");
        
        if (destination.length() < 20 && !destination.toLowerCase().contains("tunis")) {
            destination += ", Tunisie";
        }
        String difficulty = trip.getDifficulty() != null ? trip.getDifficulty().name() : "MODERATE";
        String comfortLevel = trip.getComfortLevel() != null ? trip.getComfortLevel() : "Standard";

        String systemPrompt = "Tu es l'IA experte de CampConnect Tunisie, spécialisée dans la planification de trips réels en Tunisie. " +
                "Ton rôle est de transformer une destination en un programme d'aventure AUTHENTIQUE. " +
                "DIRECTIVES CRUCIALES: " +
                "1. Utilise des lieux et établissements RÉELS et CONNUS en Tunisie. " +
                "2. Propose des activités spécifiques au terrain. " +
                "3. Les prix DOIVENT être réalistes pour le marché tunisien (en DT). " +
                "4. Réponds UNIQUEMENT avec le JSON.";

        String userMessage = String.format(
                "Génère un itinéraire RÉEL de %d jours pour : %s\n" +
                "- Participants: %d | Budget max/pers: %.2f DT | Difficulté: %s\n" +
                "Réponds UNIQUEMENT avec le JSON formaté comme un tableau d'objets.",
                duration, destination, participants, budgetPerPerson, difficulty);

        String aiResponse = openAiService.generateText(systemPrompt, userMessage);

        // Extract JSON array robustly
        int startIndex = aiResponse.indexOf('[');
        int endIndex = aiResponse.lastIndexOf(']');

        if (startIndex != -1 && endIndex != -1 && endIndex > startIndex) {
            aiResponse = aiResponse.substring(startIndex, endIndex + 1);
            // Validate JSON
            objectMapper.readTree(aiResponse);
            return aiResponse;
        } else {
            throw new RuntimeException("Aucun tableau JSON trouvé dans la réponse de l'IA.");
        }
    }

    private String generateLocalFallbackItinerary(Trip trip, long durationDays) {
        try {
            java.util.List<Map<String, Object>> days = new java.util.ArrayList<>();
            java.util.List<String> activities = trip.getActivities() != null ? trip.getActivities() : new java.util.ArrayList<>();
            int activitiesPerDay = activities.isEmpty() ? 0 : Math.max(1, activities.size() / (int) durationDays);
            int activityIndex = 0;

            for (int i = 1; i <= durationDays; i++) {
                Map<String, Object> day = new HashMap<>();
                day.put("dayNumber", i);
                if (i == 1) {
                    day.put("title", "Arrivée et Installation");
                    day.put("description", "Installation au campement et découverte des lieux.");
                } else if (i == durationDays) {
                    day.put("title", "Dernier jour et Départ");
                    day.put("description", "Rangement, dernières activités et retour.");
                } else {
                    day.put("title", "Aventure et Découverte - Jour " + i);
                    day.put("description", "Profitez de la nature et de vos activités prévues.");
                }

                java.util.List<Map<String, String>> dayActivities = new java.util.ArrayList<>();
                int currentDayActivities = (i == durationDays && activityIndex < activities.size()) ? (activities.size() - activityIndex) : activitiesPerDay;
                
                for (int j = 0; j < currentDayActivities && activityIndex < activities.size(); j++) {
                    Map<String, String> act = new HashMap<>();
                    act.put("time", (10 + j * 3) + ":00");
                    act.put("name", activities.get(activityIndex));
                    act.put("description", "Profitez de cette activité avec le groupe.");
                    dayActivities.add(act);
                    activityIndex++;
                }

                if (dayActivities.isEmpty()) {
                    Map<String, String> freeTime = new HashMap<>();
                    freeTime.put("time", "14:00");
                    freeTime.put("name", "Quartier Libre");
                    freeTime.put("description", "Temps libre pour se détendre et explorer.");
                    dayActivities.add(freeTime);
                }

                day.put("activities", dayActivities);
                days.add(day);
            }
            return objectMapper.writeValueAsString(days);
        } catch (Exception ex) {
            log.error("Erreur critique lors de la génération du fallback", ex);
            return "[{\"dayNumber\":1,\"title\":\"Problème technique\",\"description\":\"Veuillez réessayer plus tard.\",\"activities\":[]}]";
        }
    }

    private long getDuration(Trip trip) {
        if (trip.getStartDate() != null && trip.getEndDate() != null) {
            // Durée inclusive (ex: 1 jour si start=end le même jour)
            long d = Duration.between(trip.getStartDate(), trip.getEndDate()).toDays();
            return Math.max(d + 1, 1);
        }
        return 1;
    }

    /**
     * Génère 3 options d'itinéraires (LOW, MEDIUM, HIGH budget) via le service Python AI
     */
    public ItineraryOptionsResponse generateThreeItineraryOptions(Trip trip, String feedback) {
        try {
            long duration = getDuration(trip);
            int participants = trip.getParticipants() > 0 ? trip.getParticipants() : 1;
            
            // Déterminer la région et la saison depuis la destination
            String region = extractRegion(trip);
            String season = extractSeason();
            
            if (feedback != null && !feedback.isBlank()) {
                log.info("Régénération avec feedback utilisateur: '{}' — {} jours, {} participants, région: {}", 
                        feedback, duration, participants, region);
            } else {
                log.info("Génération planning: {} jours, {} participants, région: {}, saison: {}",
                        duration, participants, region, season);
            }

            // 0) Validation destination AVANT génération
            Map<String, Object> validateReq = new HashMap<>();
            validateReq.put("region", region);
            ResponseEntity<Map> validateResp = restTemplate.postForEntity(
                    aiEndpoint("/validate-itinerary-destination"),
                    validateReq,
                    Map.class
            );
            Map<String, Object> validateBody = validateResp.getBody();
            boolean isValidDestination = validateBody != null && Boolean.TRUE.equals(validateBody.get("valid"));
            if (!isValidDestination) {
                String msg = validateBody != null && validateBody.get("message") != null
                        ? validateBody.get("message").toString()
                        : "Destination non valide pour l'itinéraire.";
                return ItineraryOptionsResponse.builder()
                        .status("invalid_destination")
                        .message(msg)
                        .region(region)
                        .season(season)
                        .durationDays((int) duration)
                        .numPeople(participants)
                        .programs(new ArrayList<>())
                        .build();
            }

            // Utiliser la région normalisée renvoyée par l'AI si disponible
            String matchedRegion = validateBody != null && validateBody.get("matched_region") != null
                    ? validateBody.get("matched_region").toString()
                    : region;
            
            // Préparer la requête pour le service Python
            Map<String, Object> itineraryRequest = new HashMap<>();
            itineraryRequest.put("region", matchedRegion);
            itineraryRequest.put("season", season);
            itineraryRequest.put("duration_days", (int) duration);
            itineraryRequest.put("budget_level", "varied");
            itineraryRequest.put("total_budget_tnd", trip.getTotalBudget() != null ? trip.getTotalBudget().doubleValue() : 0.0);
            itineraryRequest.put("num_people", participants);
            // Variation seed pour éviter un planning identique en régénération
            itineraryRequest.put("variation_seed", (int) (System.currentTimeMillis() % 1_000_000_007L));
            itineraryRequest.put("distance_km", 200.0);
            // Pass user feedback to AI for context
            if (feedback != null && !feedback.isBlank()) {
                itineraryRequest.put("user_feedback", feedback);
            }
            
            // Appeler le endpoint /recommend-itinerary du service Python
            ResponseEntity<ItineraryOptionsResponse> response = restTemplate.postForEntity(
                    aiEndpoint("/recommend-itinerary"),
                    itineraryRequest,
                    ItineraryOptionsResponse.class
            );
            
            ItineraryOptionsResponse out = response.getBody();
            if (out != null) {
                out.setMessage("Destination validée. Planning varié généré avec succès.");
            }
            return out;
            
        } catch (Exception e) {
            log.error(
                    "Erreur lors de la génération des 3 itinéraires via Python AI (vérifiez que le service tourne sur {}). Cause: {}",
                    aiServiceBaseUrl,
                    e.toString(),
                    e
            );
            return ItineraryOptionsResponse.builder()
                    .status("error")
                    .message("Échec de génération des options d'itinéraire.")
                    .region("N/A")
                    .season("N/A")
                    .durationDays((int) getDuration(trip))
                    .numPeople(trip.getParticipants())
                    .programs(new java.util.ArrayList<>())
                    .build();
        }
    }

    public ItineraryBudgetPredictionResponse predictBudgetForSelectedItinerary(
            Trip trip,
            ItineraryBudgetPredictRequest request
    ) {
        ItineraryOptionDto selectedProgram = null;
        List<Map<String, Object>> selectedActivities = new ArrayList<>();
        try {
            ItineraryOptionsResponse options = generateThreeItineraryOptions(trip, null);
            if (options == null || options.getPrograms() == null || options.getPrograms().isEmpty()) {
                return buildLocalBudgetFallback(trip, request, null, null,
                        "Mode secours: options indisponibles, estimation locale appliquée.");
            }

            selectedProgram = options.getPrograms().stream()
                    .filter(p -> p.getProgramId() != null && p.getProgramId().equals(request.getProgramId()))
                    .findFirst()
                    .orElse(options.getPrograms().get(0));

            long duration = getDuration(trip);
            int participants = (request.getNumPeople() != null && request.getNumPeople() > 0)
                    ? request.getNumPeople()
                    : (trip.getParticipants() > 0 ? trip.getParticipants() : 1);

            String region = extractRegion(trip);
            String season = extractSeason();

            selectedActivities = new ArrayList<>();
            if (request.getSelectedActivities() != null && !request.getSelectedActivities().isEmpty()) {
                for (ItineraryActivityDto activity : request.getSelectedActivities()) {
                    Map<String, Object> act = new HashMap<>();
                    act.put("id", activity.getId());
                    act.put("name", activity.getName());
                    act.put("description", activity.getDescription());
                    act.put("type", activity.getType());
                    act.put("price", activity.getPrice() != null ? activity.getPrice() : 0.0);
                    act.put("duration", activity.getDuration() != null ? activity.getDuration() : 1.0);
                    selectedActivities.add(act);
                }
            } else {
                Set<Long> selectedIds = request.getSelectedActivityIds() != null
                        ? new HashSet<>(request.getSelectedActivityIds())
                        : new HashSet<>();
                Set<String> selectedNames = new HashSet<>();
                if (request.getSelectedActivityNames() != null) {
                    request.getSelectedActivityNames().forEach(n -> {
                        if (n != null) selectedNames.add(n.trim().toLowerCase());
                    });
                }

                if (selectedProgram.getDays() != null) {
                    for (ItineraryDayDto day : selectedProgram.getDays()) {
                        if (day.getActivities() != null) {
                            for (ItineraryActivityDto activity : day.getActivities()) {
                                boolean include = true;
                                if (!selectedIds.isEmpty() || !selectedNames.isEmpty()) {
                                    boolean idMatch = activity.getId() != null && selectedIds.contains(activity.getId());
                                    boolean nameMatch = activity.getName() != null
                                            && selectedNames.contains(activity.getName().trim().toLowerCase());
                                    include = idMatch || nameMatch;
                                }
                                if (!include) {
                                    continue;
                                }
                                Map<String, Object> act = new HashMap<>();
                                act.put("id", activity.getId());
                                act.put("name", activity.getName());
                                act.put("description", activity.getDescription());
                                act.put("type", activity.getType());
                                act.put("price", activity.getPrice() != null ? activity.getPrice() : 0.0);
                                act.put("duration", activity.getDuration() != null ? activity.getDuration() : 1.0);
                                selectedActivities.add(act);
                            }
                        }
                    }
                }
            }

            Double budgetGroup = request.getUserProposedBudgetTnd();
            if (budgetGroup == null && trip.getTotalBudget() != null) {
                budgetGroup = trip.getTotalBudget().doubleValue();
            }

            Map<String, Object> budgetRequest = new HashMap<>();
            budgetRequest.put("region", region);
            budgetRequest.put("season", season);
            budgetRequest.put("duration_days", (int) duration);
            budgetRequest.put("budget_level", selectedProgram.getBudgetLevel());
            budgetRequest.put("num_people", participants);
            budgetRequest.put("group_size", participants);
            budgetRequest.put("distance_km", 200.0);
            budgetRequest.put("transport_mode", request.getTransportMode() != null ? request.getTransportMode() : "car");
            budgetRequest.put("user_proposed_budget_tnd", budgetGroup);
            budgetRequest.put("selected_activities", selectedActivities);
            if (request.getIncludeFood() != null) {
                budgetRequest.put("include_food", request.getIncludeFood());
            }
            if (request.getIncludeAccommodation() != null) {
                budgetRequest.put("include_accommodation", request.getIncludeAccommodation());
            }
            if (request.getTransportCostTnd() != null) {
                budgetRequest.put("transport_cost_tnd", request.getTransportCostTnd());
            }
            if (request.getTransportCostType() != null && !request.getTransportCostType().isBlank()) {
                budgetRequest.put("transport_cost_type", request.getTransportCostType());
            }

            ResponseEntity<ItineraryBudgetPredictionResponse> response = restTemplate.postForEntity(
                    aiEndpoint("/calculate-budget-for-itinerary"),
                    budgetRequest,
                    ItineraryBudgetPredictionResponse.class
            );

            ItineraryBudgetPredictionResponse body = response.getBody();
            if (body == null) {
                return buildLocalBudgetFallback(trip, request, selectedProgram, selectedActivities,
                        "Mode secours: réponse vide du service AI, estimation locale appliquée.");
            }
            return body;
        } catch (Exception e) {
            log.error("Erreur lors de la prédiction budget de l'itinéraire sélectionné: {}", e.getMessage());
            return buildLocalBudgetFallback(trip, request, selectedProgram, selectedActivities,
                    "Mode secours: service AI indisponible, estimation locale appliquée.");
        }
    }

    private ItineraryBudgetPredictionResponse buildLocalBudgetFallback(
            Trip trip,
            ItineraryBudgetPredictRequest request,
            ItineraryOptionDto selectedProgram,
            List<Map<String, Object>> selectedActivities,
            String advice
    ) {
        int participants = trip.getParticipants() > 0 ? trip.getParticipants() : 1;
        long duration = Math.max(getDuration(trip), 1);
        double distanceKm = 120.0; // estimation locale moyenne (aller/retour régional)
        String transport = request.getTransportMode() != null ? request.getTransportMode().toLowerCase() : "car";
        double transportMultiplier = "bus".equals(transport) ? 0.7
                : ("train".equals(transport) ? 0.6
                : ("van".equals(transport) ? 1.25 : 1.0));

        // Aligné sur Python: billet/personne, location/jour groupe, ou forfait — sinon au km
        double transportCost;
        Double transportUnit = request.getTransportCostTnd();
        String costType = request.getTransportCostType() != null
                ? request.getTransportCostType().trim().toLowerCase()
                : null;
        if (transportUnit != null && transportUnit > 0) {
            if ("per_day_group".equals(costType) || "rental_per_day".equals(costType) || "per_day".equals(costType)) {
                transportCost = transportUnit * duration;
            } else if ("flat_group".equals(costType) || "flat".equals(costType) || "forfait".equals(costType)) {
                transportCost = transportUnit;
            } else {
                // per_person, ticket, ou inconnu
                transportCost = transportUnit * participants;
            }
        } else {
            transportCost = distanceKm * 0.5 * transportMultiplier;
        }

        boolean includeAccommodation = request.getIncludeAccommodation() != null ? request.getIncludeAccommodation() : false;
        double accommodation = includeAccommodation ? participants * duration * 15.0 : 0.0;
        
        boolean includeFood = request.getIncludeFood() != null ? request.getIncludeFood() : false;
        double food = includeFood ? participants * duration * 20.0 : 0.0;

        // Prix activités du dataset = par personne (comme /calculate-budget-for-itinerary Python)
        double activities = 0.0;
        if (selectedActivities != null && !selectedActivities.isEmpty()) {
            double sumPerPerson = 0.0;
            for (Map<String, Object> a : selectedActivities) {
                Object p = a.get("price");
                if (p instanceof Number) {
                    sumPerPerson += Math.max(((Number) p).doubleValue(), 0.0);
                }
            }
            activities = sumPerPerson * participants;
        } else if (selectedProgram != null && selectedProgram.getDays() != null) {
            double sumPerPerson = 0.0;
            for (ItineraryDayDto day : selectedProgram.getDays()) {
                if (day.getActivities() != null) {
                    for (ItineraryActivityDto act : day.getActivities()) {
                        if (act.getPrice() != null && act.getPrice() > 0) {
                            sumPerPerson += act.getPrice();
                        }
                    }
                }
            }
            activities = sumPerPerson * participants;
        } else {
            // fallback minimal si aucune activité détaillée
            activities = duration * participants * 18.0;
        }

        double estimated = transportCost + accommodation + food + activities;

        Double userBudget = request.getUserProposedBudgetTnd();
        if (userBudget == null && trip.getTotalBudget() != null) {
            userBudget = trip.getTotalBudget().doubleValue();
        }
        String budgetStatus = (userBudget == null || estimated <= userBudget) ? "Dans le budget" : "Dépasse le budget";

        return ItineraryBudgetPredictionResponse.builder()
                .status("success")
                .budgetLevel("varied")
                .totalBudgetTnd(estimated)
                .perPersonTnd(estimated / participants)
                .breakdown(ItineraryBudgetBreakdownDto.builder()
                        .transport(transportCost)
                        .hebergement(accommodation)
                        .nourriture(food)
                        .activites(activities)
                        .total(estimated)
                        .build())
                .budgetStatus(budgetStatus)
                .budgetAdvice(advice)
                .riskLevel("N/A")
                .predictedTotalBudgetTnd(estimated)
                .estimatedTotalBudgetTnd(estimated)
                .timestamp(java.time.Instant.now().toString())
                .build();
    }

    /**
     * Extrait la région depuis la destination du trip
     */
    private String extractRegion(Trip trip) {
        if (trip.getDestination() != null && trip.getDestination().getAddress() != null) {
            String rawAddress = trip.getDestination().getAddress();
            String address = rawAddress.toLowerCase();
            // Mapping précis aligné avec les régions du dataset
            if (address.contains("kebili") || address.contains("douz") || address.contains("ksar ghilane")) return "Kébili";
            if (address.contains("tozeur") || address.contains("tamerza") || address.contains("chebika")) return "Tozeur";
            if (address.contains("gabes") || address.contains("gabès")) return "Gabès";
            if (address.contains("bizerte") || address.contains("raf raf") || address.contains("cap angela")) return "Bizerte";
            if (address.contains("nabeul") || address.contains("hammamet") || address.contains("korba")) return "Nabeul";
            if (address.contains("siliana") || address.contains("kesra")) return "Siliana";
            if (address.contains("zaghouan") || address.contains("zriba")) return "Zaghouan";
            if (address.contains("beja") || address.contains("béja") || address.contains("testour")) return "Béja";
            if (
                address.contains("jendouba")
                || address.contains("ain draham")
                || address.contains("aïn draham")
                || address.contains("beni m'tir")
                || address.contains("beni mtir")
                || address.contains("bni mtir")
                || address.contains("bni m'tir")
            ) return "Jendouba";
            if (address.contains("kairouan")) return "Kairouan";
            if (address.contains("tunis")) return "Tunis";
            return rawAddress;
        }
        if (trip.getTitle() != null && !trip.getTitle().isBlank()) {
            return trip.getTitle();
        }
        return "Unknown";
    }

    /**
     * Détermine la saison actuelle
     */
    private String extractSeason() {
        java.time.Month month = java.time.YearMonth.now().getMonth();
        switch (month) {
            case DECEMBER:
            case JANUARY:
            case FEBRUARY:
                return "Hiver";
            case MARCH:
            case APRIL:
            case MAY:
                return "Printemps";
            case JUNE:
            case JULY:
            case AUGUST:
                return "Été";
            case SEPTEMBER:
            case OCTOBER:
            case NOVEMBER:
                return "Automne";
            default:
                return "Printemps";
        }
    }

    /**
     * Saison selon la date de début du trip (sinon mois courant).
     */
    private String extractSeasonForTrip(Trip trip) {
        java.time.Month month;
        if (trip.getStartDate() != null) {
            month = trip.getStartDate().atZone(ZoneId.systemDefault()).toLocalDate().getMonth();
        } else {
            month = java.time.YearMonth.now().getMonth();
        }
        switch (month) {
            case DECEMBER:
            case JANUARY:
            case FEBRUARY:
                return "Hiver";
            case MARCH:
            case APRIL:
            case MAY:
                return "Printemps";
            case JUNE:
            case JULY:
            case AUGUST:
                return "Été";
            case SEPTEMBER:
            case OCTOBER:
            case NOVEMBER:
                return "Automne";
            default:
                return "Printemps";
        }
    }

    /**
     * Distance routière indicative (km) selon la région cible — meilleure que fixer 200 pour tout la Tunisie.
     */
    private double estimateDistanceKm(Trip trip) {
        String normalized = Normalizer.normalize(extractRegion(trip), Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .toLowerCase(Locale.FRENCH);
        if (normalized.contains("unknown")) {
            return 220;
        }
        if (normalized.contains("tunis") || normalized.contains("ariana") || normalized.contains("marsa")) {
            return 95;
        }
        if (normalized.contains("nabeul") || normalized.contains("hammamet") || normalized.contains("korba")) {
            return 145;
        }
        if (normalized.contains("bizerte")) {
            return 135;
        }
        if (normalized.contains("jendouba") || normalized.contains("ain draham")) {
            return 185;
        }
        if (normalized.contains("beja") || normalized.contains("testour")) {
            return 165;
        }
        if (normalized.contains("siliana") || normalized.contains("kesra")) {
            return 155;
        }
        if (normalized.contains("zaghouan") || normalized.contains("zriba")) {
            return 140;
        }
        if (normalized.contains("kairouan")) {
            return 175;
        }
        if (normalized.contains("tozeur") || normalized.contains("tamerza") || normalized.contains("chebika")) {
            return 440;
        }
        if (normalized.contains("kebili") || normalized.contains("douz") || normalized.contains("ksar")) {
            return 460;
        }
        if (normalized.contains("gabes")) {
            return 390;
        }
        if (normalized.contains("djerba") || normalized.contains("medenine") || normalized.contains("zarzis")) {
            return 510;
        }
        if (normalized.contains("tataouine") || normalized.contains("douiret") || normalized.contains("chenini")) {
            return 540;
        }
        if (normalized.contains("sfax") || normalized.contains("kerkennah")) {
            return 290;
        }
        if (normalized.contains("sousse") || normalized.contains("kantaoui")) {
            return 205;
        }
        if (normalized.contains("monastir")) {
            return 185;
        }
        if (normalized.contains("mahdia")) {
            return 210;
        }
        if (normalized.contains("gafsa") || normalized.contains("metlaoui")) {
            return 320;
        }
        if (normalized.contains("kasserine") || normalized.contains("thala")) {
            return 240;
        }
        return 220;
    }


}
