package com.campconnect.controller;

import com.campconnect.model.TripFeedback;
import com.campconnect.repository.TripFeedbackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@CrossOrigin(origins = "http://localhost:4200", maxAge = 3600)
@RestController
@RequestMapping("/api/feedbacks")
@RequiredArgsConstructor
public class TripFeedbackController {

    private final TripFeedbackRepository feedbackRepository;

    @PostMapping
    public ResponseEntity<TripFeedback> leaveFeedback(@RequestBody TripFeedback feedback) {
        feedback.setCreatedAt(LocalDateTime.now());
        return ResponseEntity.ok(feedbackRepository.save(feedback));
    }

    @GetMapping("/trip/{tripId}")
    public ResponseEntity<List<TripFeedback>> getFeedbacksByTrip(@PathVariable String tripId) {
        return ResponseEntity.ok(feedbackRepository.findByTripId(tripId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TripFeedback>> getFeedbacksForUser(@PathVariable String userId) {
        return ResponseEntity.ok(feedbackRepository.findByEvaluatedUserId(userId));
    }
}
