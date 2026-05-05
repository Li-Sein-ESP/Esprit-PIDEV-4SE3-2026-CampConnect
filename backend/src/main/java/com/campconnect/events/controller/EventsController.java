package com.campconnect.events.controller;
import com.campconnect.events.dto.EventRegistrationDTO;

import com.campconnect.events.dto.EventDTO;
import com.campconnect.events.service.IEventServices;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventsController {

    @Autowired
    private IEventServices eventService;

    @Autowired
    private com.campconnect.service.AiIntegrationService aiService;

    // --- AI Integration Endpoints ---
    /**
     * Tâche IA : Prédire le Prix de l'Événement
     * Tâche IA : Prédire la popularité de l'Événement
     */
    @GetMapping("/ai-popularity-predict")
    public ResponseEntity<java.util.Map<String, Object>> getAiPopularityPredict(
            @RequestParam int categoryId,
            @RequestParam int capacity,
            @RequestParam int durationDays,
            @RequestParam String difficulty,
            @RequestParam String season) {
        java.util.Map<String, Object> prediction = aiService.predictEventPopularity(categoryId, capacity, durationDays, difficulty, season);
        if (prediction != null) {
            return ResponseEntity.ok(prediction);
        }
        return ResponseEntity.status(503).build();
    }


    @PostMapping("/ai-category")
    public ResponseEntity<java.util.Map<String, Object>> getAiEventCategory(@RequestBody java.util.Map<String, String> body) {
        String description = body.getOrDefault("description", "");
        java.util.Map<String, Object> prediction = aiService.predictEventCategory(description);
        if (prediction != null) {
            return ResponseEntity.ok(prediction);
        }
        return ResponseEntity.status(503).build(); // Service non disponible
    }

    @PostMapping("/ai-packing-list")
    public ResponseEntity<java.util.Map<String, Object>> getAiPackingList(@RequestBody java.util.Map<String, String> body) {
        String type = body.getOrDefault("event_type", "hike");
        String diff = body.getOrDefault("difficulty", "beginner");
        String season = body.getOrDefault("season", "summer");
        
        java.util.Map<String, Object> packingList = aiService.generatePackingList(type, diff, season);
        if (packingList != null) {
            return ResponseEntity.ok(packingList);
        }
        return ResponseEntity.status(503).build();
    }

    @PostMapping("/ai-odd-predict")
    public ResponseEntity<java.util.Map<String, Object>> getAiOddPredict(@RequestBody java.util.Map<String, String> body) {
        String title = body.getOrDefault("title", "");
        String description = body.getOrDefault("description", "");
        
        java.util.Map<String, Object> oddPrediction = aiService.predictEventOdd(title, description);
        if (oddPrediction != null) {
            return ResponseEntity.ok(oddPrediction);
        }
        return ResponseEntity.status(503).build();
    }
    // --------------------------------

    @GetMapping
    public List<EventDTO> getAllEvents() {
        return eventService.getAllEvents();
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventDTO> getEventById(@PathVariable String id) {
        EventDTO event = eventService.getEventById(id);
        return event != null ? ResponseEntity.ok(event) : ResponseEntity.notFound().build();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ORGANIZER')")
    public ResponseEntity<EventDTO> createEvent(@Valid @RequestBody EventDTO eventDTO) {
        return ResponseEntity.ok(eventService.createEvent(eventDTO));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ORGANIZER')")
    public ResponseEntity<EventDTO> updateEvent(@PathVariable String id, @Valid @RequestBody EventDTO eventDTO) {
        EventDTO updated = eventService.updateEvent(id, eventDTO);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteEvent(@PathVariable String id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/register")
    public ResponseEntity<EventRegistrationDTO> registerForEvent(
            @PathVariable String id,
            @Valid @RequestBody EventRegistrationDTO registrationDTO) {
        EventRegistrationDTO result = eventService.registerUser(id, registrationDTO.getUserId(), registrationDTO.getParticipants());
        if (result == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}/participants")
    public ResponseEntity<List<EventRegistrationDTO>> getParticipants(@PathVariable String id) {
        return ResponseEntity.ok(eventService.getEventParticipants(id));
    }

    @PostMapping("/ai-recommend")
    public ResponseEntity<List<java.util.Map<String, Object>>> getAiRecommendations(@RequestBody java.util.Map<String, Object> payload) {
        String preferences = (String) payload.get("preferences");
        java.util.List<String> history = (java.util.List<String>) payload.get("history");
        return ResponseEntity.ok(eventService.getAiRecommendations(preferences, history));
    }
}
