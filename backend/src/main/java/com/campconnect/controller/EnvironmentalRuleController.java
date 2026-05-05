package com.campconnect.controller;

import com.campconnect.model.EnvironmentalRule;
import com.campconnect.repository.EnvironmentalRuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for environmental rules management.
 * Endpoint: /api/environmental-rules
 */
@RestController
@RequestMapping("/api/environmental-rules")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class EnvironmentalRuleController {

    private final EnvironmentalRuleRepository environmentalRuleRepository;

    /**
     * GET /api/environmental-rules
     * Returns all environmental rules.
     */
    @GetMapping
    public ResponseEntity<List<EnvironmentalRule>> getAllRules() {
        return ResponseEntity.ok(environmentalRuleRepository.findAll());
    }

    /**
     * POST /api/environmental-rules
     * Creates a new environmental rule.
     */
    @PostMapping
    public ResponseEntity<EnvironmentalRule> createRule(@RequestBody EnvironmentalRule rule) {
        EnvironmentalRule saved = environmentalRuleRepository.save(rule);
        return ResponseEntity.ok(saved);
    }

    /**
     * DELETE /api/environmental-rules/{id}
     * Deletes an environmental rule by ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRule(@PathVariable String id) {
        if (environmentalRuleRepository.existsById(id)) {
            environmentalRuleRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
