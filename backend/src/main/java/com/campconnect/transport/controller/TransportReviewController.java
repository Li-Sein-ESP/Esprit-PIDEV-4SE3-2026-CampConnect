package com.campconnect.transport.controller;

import com.campconnect.predict.service.OpenAIService;
import com.campconnect.transport.dto.TransportReviewDTO;
import com.campconnect.transport.entity.Transport;
import com.campconnect.transport.entity.TransportReview;
import com.campconnect.transport.repository.TransportRepository;
import com.campconnect.transport.repository.TransportReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transports/{transportId}/reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class TransportReviewController {
    
    private final TransportReviewRepository reviewRepository;
    private final TransportRepository transportRepository;
    private final OpenAIService openAIService;

    @GetMapping
    public List<TransportReview> list(@PathVariable("transportId") String transportId) {
        return reviewRepository.findByTransportId(transportId);
    }

    @PostMapping
    public ResponseEntity<TransportReview> create(@PathVariable("transportId") String transportId,
                                                  @RequestBody TransportReviewDTO dto) {
        Transport transport = transportRepository.findById(transportId).orElseThrow(() ->
                new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Transport not found"));

        // AI Moderation Step
        String systemPrompt = "You are a content moderator for a camping and transport application. Look at the user review and respond with purely 'APPROVED' if it is safe, polite and constructive, or 'REJECTED: <reason>' if it contains spam, insults, or inappropriate content.";
        String userPrompt = "Review this comment: " + dto.getComment();
        
        String aiResponse = openAIService.generateText(systemPrompt, userPrompt);
        if (aiResponse != null && aiResponse.startsWith("REJECTED")) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Commentaiere rejeté par l'IA: " + aiResponse);
        }

        TransportReview review = new TransportReview(transportId, dto.getUserId(), dto.getRating(), dto.getComment());
        TransportReview saved = reviewRepository.save(review);

        // update aggregate
        List<TransportReview> all = reviewRepository.findByTransportId(transportId);
        double avg = all.stream().mapToInt(TransportReview::getRating).average().orElse(0.0);
        transport.setAverageRating(avg);
        transport.setReviewCount(all.size());
        transportRepository.save(transport);

        return ResponseEntity.ok(saved);
    }
}
