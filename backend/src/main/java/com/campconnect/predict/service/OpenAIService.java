package com.campconnect.predict.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class OpenAIService {

    private static final int CONNECT_TIMEOUT_MS = 8000;
    private static final int READ_TIMEOUT_MS = 20000;

    @Value("${openai.api.key}")
    private String openAiApiKey; // Contains Gemini Key

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = createRestTemplate();

    private RestTemplate createRestTemplate() {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(CONNECT_TIMEOUT_MS);
        requestFactory.setReadTimeout(READ_TIMEOUT_MS);
        return new RestTemplate(requestFactory);
    }

    /**
     * Appelle l'API Google Gemini 2.5 Flash pour générer du texte.
     */
    public String generateText(String systemPrompt, String userMessage) {
        String trimmedKey = openAiApiKey != null ? openAiApiKey.trim() : "";
        if (trimmedKey.isEmpty() || trimmedKey.equals("sk-placeholder") || trimmedKey.startsWith("sk-your-api-key")) {
            log.warn("API Key is missing, placeholder or default. Returning mock prediction.");
            return "Mock AI Response: Please configure proper API_KEY in environment to get real predictions.";
        }

        try {
            // Structure de requête pour Google Gemini API
            Map<String, Object> requestBody = new HashMap<>();
            
            // On peut passer le systemPrompt dans systemInstruction (v1beta)
            requestBody.put("systemInstruction", Map.of(
                "parts", List.of(Map.of("text", systemPrompt))
            ));

            requestBody.put("contents", List.of(
                Map.of("parts", List.of(Map.of("text", userMessage)))
            ));

            requestBody.put("generationConfig", Map.of(
                "temperature", 0.2,
                "maxOutputTokens", 4096
            ));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            // Endpoint Gemini 2.5 Flash (v1beta)
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + trimmedKey;
            
            log.info("Calling Gemini AI Service for text generation...");
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            JsonNode root = objectMapper.readTree(response.getBody());
            // Extraction du texte : candidates[0].content.parts[0].text
            return root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();

        } catch (Exception e) {
            log.error("Failed to generate text from AI Service (Gemini): {}", e.getMessage());
            return "Error from AI Service: " + e.getMessage();
        }
    }
}
