package com.campconnect.trip.controller;

import com.campconnect.trip.dto.TripDTO;
import com.campconnect.trip.entity.Trip;
import com.campconnect.trip.service.ITripService;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.campconnect.service.UserDetailsImpl;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController("itineraryTripController")
@RequestMapping("/api/trips")
@CrossOrigin(origins = "http://localhost:4200")
public class TripController {
    private final ITripService service;
    private final com.fasterxml.jackson.databind.ObjectMapper mapper;
    private static final Logger logger = LoggerFactory.getLogger(TripController.class);

    public TripController(@Qualifier("itineraryTripService") ITripService service,
                          com.fasterxml.jackson.databind.ObjectMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @GetMapping
    public List<Trip> getAll() {
        return service.findAll();
    }

    @GetMapping("/templates")
    public List<Trip> getTemplates() {
        return service.findTemplateTrips();
    }

    @GetMapping("/{id}")
    public Trip getById(@PathVariable("id") String id) {
        return service.findById(id);
    }

    @GetMapping("/user/{userId}")
    public List<Trip> getByUserId(@PathVariable("userId") String userId) {
        logger.info("HTTP GET /api/trips/user/{} - fetching trips for specific user", userId);
        List<Trip> result = service.findByUserId(userId);
        logger.info("Discovery complete: user '{}' has {} trips in collection", userId, result == null ? 0 : result.size());
        return result;
    }

    @PostMapping
    public Trip create(@jakarta.validation.Valid @RequestBody TripDTO dto,
                       @AuthenticationPrincipal UserDetailsImpl currentUser) {
        logger.info("HTTP POST /api/trips - create request for userId='{}', title='{}'", dto.getUserId(), dto.getTitle());
        if ((dto.getUserId() == null || dto.getUserId().isBlank()) && currentUser != null) {
            dto.setUserId(currentUser.getId());
            logger.info("Setting userId from authenticated principal: '{}'", currentUser.getId());
        } else if (dto.getUserId() != null) {
            logger.info("Using userId provided in DTO: '{}'", dto.getUserId());
        } else {
            logger.warn("No userId found in DTO and no authenticated user principal available!");
        }
        
        Trip saved = service.save(dto);
        logger.info("[TRIP_CREATE_SUCCESS] id='{}' for userId='{}', template={}", saved.getId(), saved.getUserId(), saved.isTemplate());
        return saved;
    }

    @PutMapping("/{id}")
    public Trip update(@PathVariable("id") String id,
                       @RequestBody java.util.Map<String, Object> payload,
                       @AuthenticationPrincipal UserDetailsImpl currentUser) {
        Trip existing = service.findById(id);
        if (currentUser == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        boolean isAdmin = currentUser.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
        if (!isAdmin && (existing.getUserId() == null || !existing.getUserId().equals(currentUser.getId()))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed to update this trip");
        }

        // Convert partial payload to DTO using Spring-managed ObjectMapper
        TripDTO dto = mapper.convertValue(payload, TripDTO.class);

        // Preserve owner if not provided in the DTO
        if (dto.getUserId() == null || dto.getUserId().isBlank()) {
            dto.setUserId(existing.getUserId());
        }

        Trip updated = service.update(id, dto);
        logger.info("Updated trip id='{}' by user='{}'", id, currentUser.getId());
        return updated;
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable("id") String id,
                       @AuthenticationPrincipal UserDetailsImpl currentUser) {
        Trip existing = service.findById(id);
        if (currentUser == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        boolean isAdmin = currentUser.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
        if (!isAdmin && (existing.getUserId() == null || !existing.getUserId().equals(currentUser.getId()))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed to delete this trip");
        }
        service.delete(id);
        logger.info("Deleted trip id='{}' by user='{}'", id, currentUser.getId());
    }

    @PostMapping("/{tripId}/assign-transport/{transportId}")
    public void assignTransport(@PathVariable("tripId") String tripId,
            @PathVariable("transportId") String transportId) {
        service.addTransportToTrip(tripId, transportId);
    }

    @PostMapping("/{tripId}/assign-itinerary/{itineraryId}")
    public void assignItinerary(@PathVariable("tripId") String tripId,
            @PathVariable("itineraryId") String itineraryId) {
        service.addItineraryToTrip(tripId, itineraryId);
    }

    @GetMapping("/search")
    public List<Trip> search(@RequestParam("q") String query) {
        return service.searchByKeywords(query);
    }

    @GetMapping("/advanced-search")
    public List<Trip> advancedSearch(@RequestParam("difficulty") String difficulty, @RequestParam("address") String address) {
        return service.searchByCriteria(difficulty, address);
    }

    @GetMapping("/difficulty-stats")
    public List<java.util.Map<String, Object>> getDifficultyStats() {
        return service.getDifficultyStats();
    }

    @GetMapping("/admin/debug-collections")
    public java.util.Set<String> debugCollections() {
        return service.getDatabaseCollections();
    }
}
