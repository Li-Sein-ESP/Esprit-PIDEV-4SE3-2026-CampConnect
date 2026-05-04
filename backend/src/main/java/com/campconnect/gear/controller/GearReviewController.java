package com.campconnect.gear.controller;

import com.campconnect.common.PagedResponse;
import com.campconnect.gear.dto.GearReviewRequest;
import com.campconnect.gear.dto.GearReviewResponse;
import com.campconnect.gear.service.GearReviewService;
import com.campconnect.service.UserDetailsImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/gear/reviews")
@RequiredArgsConstructor
@Tag(name = "Gear Reviews", description = "Ratings and reviews for gear items")
public class GearReviewController {

    private final GearReviewService gearReviewService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Submit a review for a gear item")
    public ResponseEntity<GearReviewResponse> addReview(
            @Valid @RequestBody GearReviewRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        GearReviewResponse response = gearReviewService.createReview(request, userDetails.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{gearId}")
    @Operation(summary = "Get reviews for a specific gear item")
    public ResponseEntity<PagedResponse<GearReviewResponse>> getReviewsForGear(
            @PathVariable String gearId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<GearReviewResponse> response = gearReviewService.getReviewsForGear(gearId, page, size);
        return ResponseEntity.ok(response);
    }
}
