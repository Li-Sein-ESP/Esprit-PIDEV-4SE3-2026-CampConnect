package com.campconnect.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campconnect.dto.TripIntentDto;
import com.campconnect.model.TripIntent;
import com.campconnect.service.ITripIntentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@CrossOrigin(origins = "http://localhost:4200", maxAge = 3600)
@RestController
@RequestMapping("/api/trip-intents")
@RequiredArgsConstructor
public class TripIntentController {

    private final ITripIntentService tripIntentService;

    @PostMapping
    public ResponseEntity<TripIntentDto> createTripIntent(@Valid @RequestBody TripIntentDto dto) {
        TripIntent tripIntent = mapDtoToEntity(dto);
        TripIntent created = tripIntentService.createTripIntent(tripIntent);
        return new ResponseEntity<>(mapEntityToDto(created), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TripIntentDto> getTripIntentById(@PathVariable("id") String id) {
        String currentUserId = null;
        try {
            org.springframework.security.core.Authentication authentication = 
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof com.campconnect.service.UserDetailsImpl) {
                currentUserId = ((com.campconnect.service.UserDetailsImpl) authentication.getPrincipal()).getId();
            }
        } catch (Exception e) {}
        return ResponseEntity.ok(mapEntityToDto(tripIntentService.getTripIntentById(id, currentUserId)));
    }

    @GetMapping("/creator/{userId}")
    public ResponseEntity<List<TripIntentDto>> getTripIntentsByCreator(@PathVariable("userId") String userId) {
        List<TripIntentDto> dtos = tripIntentService.getTripIntentsByCreator(userId).stream()
                .map(this::mapEntityToDto).toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/open")
    public ResponseEntity<List<TripIntentDto>> getAllOpenTripIntents() {
        String currentUserId = null;
        try {
            org.springframework.security.core.Authentication authentication = 
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof com.campconnect.service.UserDetailsImpl) {
                currentUserId = ((com.campconnect.service.UserDetailsImpl) authentication.getPrincipal()).getId();
            }
        } catch (Exception e) {
            // Silently ignore if not authenticated
        }
        List<TripIntentDto> dtos = tripIntentService.getAllOpenTripIntents(currentUserId).stream()
                .map(this::mapEntityToDto).toList();
        return ResponseEntity.ok(dtos);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TripIntentDto> updateTripIntent(@PathVariable("id") String id,
            @Valid @RequestBody TripIntentDto dto) {
        TripIntent tripIntent = mapDtoToEntity(dto);
        return ResponseEntity.ok(mapEntityToDto(tripIntentService.updateTripIntent(id, tripIntent)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTripIntent(@PathVariable("id") String id) {
        tripIntentService.deleteTripIntent(id);
        return ResponseEntity.noContent().build();
    }

    private TripIntentDto mapEntityToDto(TripIntent entity) {
        return TripIntentDto.builder()
                .id(entity.getId())
                .creatorUserId(entity.getCreatorUserId())
                .creatorName(entity.getCreatorName())
                .groupId(entity.getGroupId())
                .title(entity.getTitle())
                .dateFrom(entity.getDateFrom())
                .dateTo(entity.getDateTo())
                .budgetMax(entity.getBudgetMax())
                .campingStyle(entity.getCampingStyle())
                .experienceLevel(entity.getExperienceLevel())
                .preferredZone(entity.getPreferredZone())
                .status(entity.getStatus())
                .isTrending(entity.isTrending())
                .compatibilityScore(entity.getCompatibilityScore())
                .participantScores(entity.getParticipantScores())
                .createdAt(entity.getCreatedAt())
                .imageUrl(entity.getImageUrl())
                .build();
    }

    private TripIntent mapDtoToEntity(TripIntentDto dto) {
        return TripIntent.builder()
                .creatorUserId(dto.getCreatorUserId())
                .title(dto.getTitle())
                .dateFrom(dto.getDateFrom())
                .dateTo(dto.getDateTo())
                .budgetMax(dto.getBudgetMax())
                .campingStyle(dto.getCampingStyle())
                .experienceLevel(dto.getExperienceLevel())
                .preferredZone(dto.getPreferredZone())
                .status(dto.getStatus())
                .isTrending(dto.isTrending())
                .imageUrl(dto.getImageUrl())
                .build();
    }
}
