package com.campconnect.trip.controller;

import com.campconnect.predict.service.OpenAIService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ai-trip")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class AITripController {

    private final OpenAIService openAIService;

    @PostMapping("/route-scoring")
    public ResponseEntity<Map<String, Object>> scoreRoute(@RequestBody Map<String, Object> payload) {
        String systemPrompt = "You are an AI Route Scoring assistant for outdoor enthusiasts. Evaluate the safety, scenery, and difficulty of the provided route details on a scale of 1-100, and give a short justification.";
        String userPrompt = "Please score this route: " + payload.toString();

        String aiResponse = openAIService.generateText(systemPrompt, userPrompt);

        Map<String, Object> response = new HashMap<>();
        response.put("route_score", aiResponse);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/planner")
    public ResponseEntity<Map<String, Object>> planTrip(@RequestBody Map<String, Object> payload) {
        String systemPrompt = "You are an AI Trip Planner. Generate a clear, day-by-day itinerary based on the user's preferences, budget, and destination.";
        String userPrompt = "Plan a trip with these constraints: " + payload.toString();

        String aiResponse = openAIService.generateText(systemPrompt, userPrompt);

        Map<String, Object> response = new HashMap<>();
        response.put("trip_plan", aiResponse);
        return ResponseEntity.ok(response);
    }
}
