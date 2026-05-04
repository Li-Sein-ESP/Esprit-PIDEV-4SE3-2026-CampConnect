package com.campconnect.controller;

import com.campconnect.dto.ComplianceChatRequest;
import com.campconnect.model.Campsite;
import com.campconnect.model.EnvironmentalRule;
import com.campconnect.repository.CampsiteRepository;
import com.campconnect.repository.EnvironmentalRuleRepository;
import com.campconnect.service.GroqService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Controller for the Environmental Compliance Chatbot.
 * POST /api/compliance-chat — requires authenticated user (JWT).
 */
@RestController
@RequestMapping("/api/compliance-chat")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
@Slf4j
public class ComplianceChatController {

    private static final String SYSTEM_PROMPT_TEMPLATE =
            "You are EcoGuide 🌿, a warm and passionate environmental assistant for CampConnect — Tunisia's premier camping platform.\n" +
            "You deeply care about nature, Tunisian landscapes, and helping campers have a safe and responsible experience.\n\n" +
            "YOUR COMMUNICATION STYLE:\n" +
            "- Write in a warm, friendly, and slightly poetic tone — like a knowledgeable nature guide.\n" +
            "- Use natural, flowing sentences. NEVER list raw data, codes, or technical labels.\n" +
            "- NEVER show metadata like [CONTEXT], [RESTRICTION], [GUIDELINE], Severity:, or category codes in your response.\n" +
            "- Use emojis occasionally to add warmth (🌿, ⚠️, ✅, 🔥, 💧, 🦅) — but don't overdo it.\n" +
            "- Start your answers with a brief, engaging sentence about the region's landscape before giving rules.\n" +
            "- When a rule is a prohibition, explain WHY it matters for the environment.\n" +
            "- When a rule is a guideline, encourage and motivate the camper to follow it.\n" +
            "- Keep answers concise (3-6 sentences max) but complete and meaningful.\n" +
            "- Respond in the same language as the user's question (French if they write in French, English if English, etc.).\n\n" +
            "STRICT RULES FOR CONTENT:\n" +
            "- Base your answers EXCLUSIVELY on the rules provided below. Never invent or assume information.\n" +
            "- If a CONTEXT rule exists, weave the region's geography/climate naturally into your answer.\n" +
            "- If a question is not covered by any rule, say warmly: \"That's a great question! Unfortunately, I don't have specific guidelines covering that for this area yet.\"\n\n" +
            "Environmental data for this campsite's region (use for knowledge, but present naturally in your response — NEVER copy-paste these labels into your answer):\n" +
            "{RULES_CONTEXT}";

    private final CampsiteRepository campsiteRepository;
    private final EnvironmentalRuleRepository environmentalRuleRepository;
    private final GroqService groqService;

    /**
     * POST /api/compliance-chat
     * Accepts a compliance chat request and returns the AI assistant's reply.
     * Requires a valid JWT token (enforced by the global security filter chain).
     */
    @PostMapping
    public ResponseEntity<String> chat(@RequestBody ComplianceChatRequest request) {
        // 1. Validate input
        if (request.getCampsiteId() == null || request.getCampsiteId().isBlank()) {
            return ResponseEntity.badRequest().body("campsiteId is required.");
        }
        if (request.getUserMessage() == null || request.getUserMessage().isBlank()) {
            return ResponseEntity.badRequest().body("userMessage is required.");
        }

        // 2. Fetch campsite to get its location/region
        Optional<Campsite> campsiteOpt = campsiteRepository.findById(request.getCampsiteId());
        String region = campsiteOpt.map(Campsite::getLocation).orElse("");

        // 3. Fetch active environmental rules for this region
        List<EnvironmentalRule> rules;
        if (region.isBlank()) {
            rules = environmentalRuleRepository.findByActiveTrue();
        } else {
            rules = environmentalRuleRepository.findByActiveTrueAndRegionContainingIgnoreCase(region);
            // Fallback: if no region-specific rules found, load all active rules
            if (rules.isEmpty()) {
                rules = environmentalRuleRepository.findByActiveTrue();
            }
        }

        // 4. Serialize rules into context string
        String rulesContext;
        if (rules.isEmpty()) {
            rulesContext = "No specific environmental rules have been published for this campsite yet.";
        } else {
            rulesContext = rules.stream()
                    .map(r -> String.format("- [%s | %s | Severity: %s] %s",
                            r.getTitle(), r.getCategory(), r.getSeverity(), r.getDescription()))
                    .collect(Collectors.joining("\n"));
        }

        // 5. Build system prompt
        String systemPrompt = SYSTEM_PROMPT_TEMPLATE.replace("{RULES_CONTEXT}", rulesContext);

        log.info("Compliance chat request for campsite '{}' (region: '{}'), {} rules loaded.",
                request.getCampsiteId(), region, rules.size());

        // 6. Call Groq API and return reply
        String reply = groqService.chat(systemPrompt, request.getConversationHistory(), request.getUserMessage());
        return ResponseEntity.ok(reply);
    }
}
