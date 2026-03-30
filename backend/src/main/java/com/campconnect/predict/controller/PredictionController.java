package com.campconnect.predict.controller;

import com.campconnect.predict.service.OpenAIService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/predict")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class PredictionController {

    private final OpenAIService openAIService;

    @PostMapping("/budget")
    public ResponseEntity<Map<String, Object>> predictBudget(@RequestBody Map<String, Object> payload) {
        String systemPrompt = "You are an expert travel budget estimator for CampConnect. Give a realistic estimated budget breakdown based on the trip details.";
        String userPrompt = "Analyze the following trip details and provide a budget prediction: " + payload.toString();
        
        String aiResponse = openAIService.generateText(systemPrompt, userPrompt);
        
        Map<String, Object> response = new HashMap<>();
        response.put("predicted_budget", aiResponse);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/delay")
    public ResponseEntity<Map<String, Object>> predictDelay(@RequestBody Map<String, Object> payload) {
        String systemPrompt = "You are an AI delay prediction system for travelers. Consider weather, distance, and transport type to estimate potential transit delays in minutes and explain why.";
        String userPrompt = "Evaluate the following route details and estimate any expected delays: " + payload.toString();
        
        String aiResponse = openAIService.generateText(systemPrompt, userPrompt);
        
        Map<String, Object> response = new HashMap<>();
        response.put("predicted_delay", aiResponse);
        return ResponseEntity.ok(response);
    }
}
