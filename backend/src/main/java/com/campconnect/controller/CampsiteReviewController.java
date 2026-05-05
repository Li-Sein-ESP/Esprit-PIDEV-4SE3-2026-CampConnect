package com.campconnect.controller;

import com.campconnect.model.Campsite;
import com.campconnect.model.CampsiteReview;
import com.campconnect.repository.CampsiteRepository;
import com.campconnect.repository.CampsiteReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/campsites")
@CrossOrigin(origins = "http://localhost:4200")
public class CampsiteReviewController {

    @Autowired
    private CampsiteReviewRepository reviewRepository;

    @Autowired
    private CampsiteRepository campsiteRepository;

    @GetMapping("/{campsiteId}/reviews")
    public ResponseEntity<List<CampsiteReview>> getReviewsByCampsite(@PathVariable String campsiteId) {
        return ResponseEntity.ok(reviewRepository.findByCampsiteIdOrderByCreatedAtDesc(campsiteId));
    }

    @PostMapping("/{campsiteId}/reviews")
    public ResponseEntity<CampsiteReview> addReview(@PathVariable String campsiteId, @RequestBody CampsiteReview review) {
        review.setCampsiteId(campsiteId);
        CampsiteReview saved = reviewRepository.save(review);
        
        // Update campsite rating
        updateCampsiteRating(campsiteId);
        
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{campsiteId}/reviews/{reviewId}/react")
    public ResponseEntity<CampsiteReview> toggleReaction(@PathVariable String campsiteId, @PathVariable String reviewId, @RequestParam String userId) {
        Optional<CampsiteReview> opt = reviewRepository.findById(reviewId);
        if (opt.isPresent()) {
            CampsiteReview review = opt.get();
            if (review.getHelpfulByUsers().contains(userId)) {
                review.getHelpfulByUsers().remove(userId);
            } else {
                review.getHelpfulByUsers().add(userId);
            }
            return ResponseEntity.ok(reviewRepository.save(review));
        }
        return ResponseEntity.notFound().build();
    }

    private void updateCampsiteRating(String campsiteId) {
        List<CampsiteReview> reviews = reviewRepository.findByCampsiteIdOrderByCreatedAtDesc(campsiteId);
        if (!reviews.isEmpty()) {
            double total = 0;
            int count = 0;
            for (CampsiteReview r : reviews) {
                if (r.getRating() != null && r.getRating() > 0) {
                    total += r.getRating();
                    count++;
                }
            }
            if (count > 0) {
                double avg = total / count;
                // Round to 1 decimal place
                avg = Math.round(avg * 10.0) / 10.0;
                
                Optional<Campsite> optCampsite = campsiteRepository.findById(campsiteId);
                if (optCampsite.isPresent()) {
                    Campsite campsite = optCampsite.get();
                    campsite.setRating(avg);
                    campsite.setReviewCount(reviews.size()); // all reviews count
                    campsiteRepository.save(campsite);
                }
            }
        }
    }
}
