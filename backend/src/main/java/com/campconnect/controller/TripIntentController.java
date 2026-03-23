package com.campconnect.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

@RestController
@RequestMapping("/api/trip-intents")
@RequiredArgsConstructor
public class TripIntentController {

    private final ITripIntentService tripIntentService;

    @PostMapping
    public ResponseEntity<TripIntent> createTripIntent(@Valid @RequestBody TripIntentDto dto) {
        TripIntent tripIntent = mapDtoToEntity(dto);
        TripIntent created = tripIntentService.createTripIntent(tripIntent);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TripIntent> getTripIntentById(@PathVariable("id") String id) {
        return ResponseEntity.ok(tripIntentService.getTripIntentById(id));
    }

    @GetMapping("/creator/{userId}")
    public ResponseEntity<List<TripIntent>> getTripIntentsByCreator(@PathVariable("userId") String userId) {
        return ResponseEntity.ok(tripIntentService.getTripIntentsByCreator(userId));
    }

    @GetMapping("/open")
    public ResponseEntity<List<TripIntent>> getAllOpenTripIntents() {
        return ResponseEntity.ok(tripIntentService.getAllOpenTripIntents());
    }

    @PutMapping("/{id}")
    public ResponseEntity<TripIntent> updateTripIntent(@PathVariable("id") String id,
            @Valid @RequestBody TripIntentDto dto) {
        TripIntent tripIntent = mapDtoToEntity(dto);
        return ResponseEntity.ok(tripIntentService.updateTripIntent(id, tripIntent));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTripIntent(@PathVariable("id") String id) {
        tripIntentService.deleteTripIntent(id);
        return ResponseEntity.noContent().build();
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
                .build();
    }
}
