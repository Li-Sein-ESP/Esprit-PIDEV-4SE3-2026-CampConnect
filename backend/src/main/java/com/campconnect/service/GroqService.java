package com.campconnect.service;

import com.campconnect.dto.MessageDTO;
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
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service for calling the Groq API (openai/gpt-oss-120b) for
 * the Environmental Compliance Chatbot feature.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GroqService {

    private static final String GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
    private static final String MODEL = "llama-3.3-70b-versatile";

    @Value("${groq.api.key:}")
    private String groqApiKey;

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Send a compliance chat message to Groq and return the AI reply.
     *
     * @param systemPrompt      The system prompt with injected environmental rules context.
     * @param conversationHistory Prior turns as MessageDTO list (role + content).
     * @param userMessage       The new user question.
     * @return The AI assistant's reply as plain text.
     */
    public String chat(String systemPrompt, List<MessageDTO> conversationHistory, String userMessage) {
        if (groqApiKey == null || groqApiKey.isBlank()) {
            log.warn("GROQ_API_KEY is not configured. Returning fallback response.");
            return "The AI compliance assistant is not configured. Please ask your administrator to set the GROQ_API_KEY.";
        }

        try {
            // Build messages array: system → history → new user message
            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", systemPrompt));

            if (conversationHistory != null) {
                for (MessageDTO msg : conversationHistory) {
                    messages.add(Map.of("role", msg.getRole(), "content", msg.getContent()));
                }
            }

            messages.add(Map.of("role", "user", "content", userMessage));

            // Build request body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", MODEL);
            requestBody.put("messages", messages);
            requestBody.put("temperature", 0.3);
            requestBody.put("max_tokens", 512);

            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(groqApiKey);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(GROQ_API_URL, entity, String.class);

            JsonNode root = objectMapper.readTree(response.getBody());
            return root.path("choices").get(0).path("message").path("content").asText();

        } catch (Exception e) {
            log.error("Groq API call failed: {}", e.getMessage());
            return "Sorry, I encountered an error while processing your question. Please try again.";
        }
    }
}
