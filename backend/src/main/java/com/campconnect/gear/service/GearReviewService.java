package com.campconnect.gear.service;

import com.campconnect.common.PagedResponse;
import com.campconnect.exception.BadRequestException;
import com.campconnect.exception.ConflictException;
import com.campconnect.exception.ResourceNotFoundException;
import com.campconnect.gear.dto.GearReviewRequest;
import com.campconnect.gear.dto.GearReviewResponse;
import com.campconnect.gear.model.Gear;
import com.campconnect.gear.model.GearReview;
import com.campconnect.gear.repository.GearRepository;
import com.campconnect.gear.repository.GearReviewRepository;
import com.campconnect.model.User;
import com.campconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GearReviewService {

    private final GearReviewRepository gearReviewRepository;
    private final GearRepository gearRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    public GearReviewResponse createReview(GearReviewRequest request, String reviewerId) {
        String gearId = request.getGearId();

        // 1. Check if gear exists
        Gear gear = gearRepository.findById(gearId)
                .orElseThrow(() -> new ResourceNotFoundException("Gear", "id", gearId));

        // 2. Check if user already reviewed
        if (gearReviewRepository.existsByGearIdAndReviewerId(gearId, reviewerId)) {
            throw new ConflictException("You have already reviewed this gear.");
        }

        // 3. Get reviewer details
        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", reviewerId));

        // 4. Create review
        GearReview review = new GearReview();
        review.setGearId(gearId);
        review.setReviewerId(reviewerId);
        review.setReviewerName(reviewer.getName());
        review.setRating(request.getRating());
        review.setComment(request.getComment());

        GearReview savedReview = gearReviewRepository.save(review);

        // 5. Update Gear average rating and count
        int oldCount = gear.getReviewCount();
        double oldAvg = gear.getAverageRating() != null ? gear.getAverageRating() : 0.0;
        
        double newAvg = ((oldAvg * oldCount) + request.getRating()) / (oldCount + 1);
        
        gear.setReviewCount(oldCount + 1);
        gear.setAverageRating(newAvg);
        gearRepository.save(gear);

        return toResponse(savedReview);
    }

    public PagedResponse<GearReviewResponse> getReviewsForGear(String gearId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<GearReview> reviewPage = gearReviewRepository.findByGearId(gearId, pageable);
        
        List<GearReviewResponse> content = reviewPage.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                reviewPage.getNumber(),
                reviewPage.getSize(),
                reviewPage.getTotalElements(),
                reviewPage.getTotalPages(),
                reviewPage.isLast()
        );
    }

    private GearReviewResponse toResponse(GearReview review) {
        return modelMapper.map(review, GearReviewResponse.class);
    }
}
