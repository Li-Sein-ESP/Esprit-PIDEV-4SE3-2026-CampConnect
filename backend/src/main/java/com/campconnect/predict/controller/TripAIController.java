package com.campconnect.predict.controller;

import com.campconnect.predict.dto.TripPredictionResponse;
import com.campconnect.predict.dto.ItineraryOptionsResponse;
import com.campconnect.predict.dto.ItineraryBudgetPredictRequest;
import com.campconnect.predict.dto.ItineraryBudgetPredictionResponse;
import com.campconnect.predict.service.TripAIPredictionService;
import com.campconnect.trip.entity.Trip;
import com.campconnect.trip.service.ITripService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/trips/ai")
@RequiredArgsConstructor
@CrossOrigin("*")
public class TripAIController {

    private final TripAIPredictionService tripAIPredictionService;
    private final ITripService tripService;

    @GetMapping("/predict/{tripId}")
    public ResponseEntity<TripPredictionResponse> getTripPredictions(@PathVariable String tripId) {
        Trip trip = tripService.findById(tripId);
        if (trip == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(tripAIPredictionService.predictTripMetrics(trip));
    }

    @GetMapping(value = "/itinerary/{tripId}", produces = "application/json")
    public ResponseEntity<String> getAiItinerary(@PathVariable String tripId) {
        Trip trip = tripService.findById(tripId);
        if (trip == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(tripAIPredictionService.generateItinerary(trip));
    }

    @GetMapping(value = "/itinerary-options/{tripId}", produces = "application/json")
    public ResponseEntity<ItineraryOptionsResponse> getThreeItineraryOptions(@PathVariable String tripId) {
        Trip trip = tripService.findById(tripId);
        if (trip == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(tripAIPredictionService.generateThreeItineraryOptions(trip, null));
    }

    @PostMapping(value = "/itinerary-options/{tripId}", produces = "application/json")
    public ResponseEntity<ItineraryOptionsResponse> regenerateItineraryOptions(
            @PathVariable String tripId,
            @RequestBody java.util.Map<String, String> body) {
        Trip trip = tripService.findById(tripId);
        if (trip == null) {
            return ResponseEntity.notFound().build();
        }
        String feedback = body != null ? body.getOrDefault("feedback", null) : null;
        return ResponseEntity.ok(tripAIPredictionService.generateThreeItineraryOptions(trip, feedback));
    }

    @PostMapping("/predict-custom")
    public ResponseEntity<TripPredictionResponse> getCustomPredictions(@RequestBody Trip trip) {
        return ResponseEntity.ok(tripAIPredictionService.predictTripMetrics(trip));
    }

    @PostMapping("/itinerary-options/{tripId}/predict-budget")
    public ResponseEntity<ItineraryBudgetPredictionResponse> predictBudgetForSelectedItinerary(
            @PathVariable String tripId,
            @RequestBody ItineraryBudgetPredictRequest request
    ) {
        Trip trip = tripService.findById(tripId);
        if (trip == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(tripAIPredictionService.predictBudgetForSelectedItinerary(trip, request));
    }

    @PostMapping("/itinerary-options/{tripId}/confirm")
    public ResponseEntity<Trip> confirmItinerary(
            @PathVariable String tripId,
            @RequestBody com.campconnect.predict.dto.ItineraryOptionDto selectedProgram
    ) {
        return ResponseEntity.ok(tripService.saveAiGeneratedItinerary(tripId, selectedProgram));
    }
}
