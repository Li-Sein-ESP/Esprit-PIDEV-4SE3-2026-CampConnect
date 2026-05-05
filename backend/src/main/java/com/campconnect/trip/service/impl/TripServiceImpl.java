package com.campconnect.trip.service.impl;

import com.campconnect.trip.dto.TripDTO;
import com.campconnect.trip.entity.Trip;
import com.campconnect.trip.repository.TripRepository;
import com.campconnect.trip.service.ITripService;
import com.campconnect.trip.repository.TripItineraryRepository;
import com.campconnect.transport.repository.TransportRepository;
import com.campconnect.transport.entity.Transport;
import com.campconnect.trip.entity.TripItinerary;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.bson.types.ObjectId;
import java.util.List;
import java.util.ArrayList;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.time.ZoneId;
import com.campconnect.trip.entity.Activity;
import java.math.BigDecimal;
import java.time.Instant;

@Service("itineraryTripService")
public class TripServiceImpl implements ITripService {

    private final TripRepository repository;
    private final TransportRepository transportRepository;
    private final TripItineraryRepository itineraryRepository;
    private final com.campconnect.trip.repository.ActivityRepository activityRepository;
    private final MongoTemplate mongoTemplate;
    private static final Logger logger = LoggerFactory.getLogger(TripServiceImpl.class);

    public TripServiceImpl(
            @Qualifier("itineraryTripRepository") TripRepository repository,
            TransportRepository transportRepository,
            TripItineraryRepository itineraryRepository,
            com.campconnect.trip.repository.ActivityRepository activityRepository,
            MongoTemplate mongoTemplate) {
        this.repository = repository;
        this.transportRepository = transportRepository;
        this.itineraryRepository = itineraryRepository;
        this.activityRepository = activityRepository;
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public Trip saveAiGeneratedItinerary(String tripId, com.campconnect.predict.dto.ItineraryOptionDto selectedProgram) {
        Trip trip = findById(tripId);
        logger.info("Saving AI generated itinerary for trip: {} - Program: {}", tripId, selectedProgram.getTitle());

        // 1. Clear existing itinerary if any (optional, but requested for "saving choice")
        // Note: For now we just add, but typically a user choice replaces previous ones
        trip.getItineraryIds().clear();

        // 2. Process each day
        if (selectedProgram.getDays() != null) {
            for (com.campconnect.predict.dto.ItineraryDayDto dayDto : selectedProgram.getDays()) {
                TripItinerary itinerary = new TripItinerary(tripId, dayDto.getDay(), dayDto.getTitle());
                itineraryRepository.save(itinerary);
                trip.getItineraryIds().add(itinerary.getId());

                // 3. Process activities for this day
                if (dayDto.getActivities() != null) {
                    for (com.campconnect.predict.dto.ItineraryActivityDto actDto : dayDto.getActivities()) {
                        Activity activity = new Activity(itinerary.getId(), actDto.getName(), actDto.getDescription());
                        activity.setCost(BigDecimal.valueOf(actDto.getPrice() != null ? actDto.getPrice() : 0.0));
                        
                        // Set location if available
                        if (actDto.getLocation() != null && !actDto.getLocation().isEmpty()) {
                            com.campconnect.model.common.LocationPoint lp = new com.campconnect.model.common.LocationPoint();
                            lp.setAddress(actDto.getLocation());
                            activity.setLocation(lp);
                        }

                        activityRepository.save(activity);
                        itinerary.getActivityIds().add(activity.getId());
                    }
                    itineraryRepository.save(itinerary);
                }
            }
        }

        // 4. Update Trip Budget with AI estimated cost
        trip.setTotalBudget(BigDecimal.valueOf(selectedProgram.getTotalEstimatedCostTnd()));
        
        return repository.save(trip);
    }

    @Override
    public List<com.campconnect.predict.dto.ItineraryDayDto> getFullItinerary(String tripId) {
        List<TripItinerary> itineraries = itineraryRepository.findByTripId(tripId);
        List<com.campconnect.predict.dto.ItineraryDayDto> result = new ArrayList<>();

        for (TripItinerary it : itineraries) {
            com.campconnect.predict.dto.ItineraryDayDto dayDto = new com.campconnect.predict.dto.ItineraryDayDto();
            dayDto.setDay(it.getDayNumber());
            dayDto.setTitle(it.getDailyDescription());
            
            List<com.campconnect.predict.dto.ItineraryActivityDto> activities = new ArrayList<>();
            for (String actId : it.getActivityIds()) {
                activityRepository.findById(actId).ifPresent(act -> {
                    com.campconnect.predict.dto.ItineraryActivityDto actDto = new com.campconnect.predict.dto.ItineraryActivityDto();
                    actDto.setId(null); // String ID vs Long AI ID
                    actDto.setName(act.getName());
                    actDto.setDescription(act.getDescription());
                    actDto.setLocation(act.getLocation() != null ? act.getLocation().getAddress() : "");
                    actDto.setPrice(act.getCost() != null ? act.getCost().doubleValue() : 0.0);
                    activities.add(actDto);
                });
            }
            dayDto.setActivities(activities);
            result.add(dayDto);
        }

        // Sort by day number
        result.sort((a, b) -> a.getDay().compareTo(b.getDay()));
        return result;
    }

    @Override
    public List<Trip> findAll() {
        logger.info("Fetching all trips from primary repository");
        return repository.findAll();
    }

    @Override
    public Trip findById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Trip not found with id: " + id));
    }

    @Override
    public Trip save(TripDTO dto) {
        Trip trip = new Trip();
        if (dto.getId() != null && !dto.getId().isEmpty()) {
            trip.setId(dto.getId());
        } else {
            trip.setId(UUID.randomUUID().toString());
        }
        mapDtoToEntity(dto, trip);
        logger.info("Saving trip - title='{}', userId='{}'", dto.getTitle(), dto.getUserId());
        Trip saved = repository.save(trip);
        logger.info("Saved trip id='{}' userId='{}'", saved.getId(), saved.getUserId());
        return saved;
    }

    @Override
    public Trip update(String id, TripDTO dto) {
        Trip trip = findById(id); // throws 404 if not found
        mapDtoToEntity(dto, trip);
        return repository.save(trip);
    }

    @Override
    public void delete(String id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Trip not found with id: " + id);
        }
        repository.deleteById(id);
    }

    @Override
    public List<Trip> findByUserId(String userId) {
        logger.info("Fetching trips for userId: '{}' from primary repository", userId);
        return repository.findByUserId(userId);
    }

    @Override
    public List<Trip> findTemplateTrips() {
        logger.info("Fetching all official mission templates");
        return repository.findByTemplate(true);
    }

    private Trip mapLegacyToModern(com.campconnect.model.Trip legacy) {
        Trip modern = new Trip();
        modern.setId(legacy.getId());
        modern.setTitle(legacy.getName());
        modern.setUserId(legacy.getCreatorId());
        
        // Map destination string to LocationPoint
        if (legacy.getDestination() != null) {
            com.campconnect.model.common.LocationPoint point = new com.campconnect.model.common.LocationPoint();
            point.setAddress(legacy.getDestination());
            modern.setDestination(point);
        }
        
        // Map Dates
        if (legacy.getStartDate() != null) {
            modern.setStartDate(legacy.getStartDate().atStartOfDay(ZoneId.systemDefault()).toInstant());
        }
        if (legacy.getEndDate() != null) {
            modern.setEndDate(legacy.getEndDate().atStartOfDay(ZoneId.systemDefault()).toInstant());
        }
        
        // Map Difficulty
        try {
            if (legacy.getDifficulty() != null) {
                modern.setDifficulty(com.campconnect.trip.enums.DifficultyLevel.valueOf(legacy.getDifficulty().toUpperCase()));
            }
        } catch (Exception e) {
            modern.setDifficulty(com.campconnect.trip.enums.DifficultyLevel.MODERATE);
        }
        
        // Status mapping
        if (legacy.getStatus() != null) {
            String s = legacy.getStatus().toUpperCase();
            if (s.contains("PLAN")) modern.setStatus(com.campconnect.trip.enums.TripStatus.PLANNED);
            else if (s.contains("COMPLET")) modern.setStatus(com.campconnect.trip.enums.TripStatus.COMPLETED);
            else modern.setStatus(com.campconnect.trip.enums.TripStatus.PLANNED);
        } else {
            modern.setStatus(com.campconnect.trip.enums.TripStatus.PLANNED);
        }
        
        return modern;
    }


    @Override
    public void addTransportToTrip(String tripId, String transportId) {
        Trip trip = findById(tripId);
        Transport transport = transportRepository.findById(transportId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transport not found"));

        String finalTransportId = transportId;

        // If this transport is already assigned to a DIFFERENT trip, clone it instead of moving it
        if (transport.getTripId() != null && !transport.getTripId().equals(tripId)) {
            Transport clonedTransport = new Transport();
            clonedTransport.setId(UUID.randomUUID().toString());
            clonedTransport.setTripId(tripId);
            clonedTransport.setMode(transport.getMode());
            clonedTransport.setCost(transport.getCost());
            clonedTransport.setDuration(transport.getDuration());
            clonedTransport.setProvider(transport.getProvider());
            clonedTransport.setRouteSegmentId(transport.getRouteSegmentId());
            clonedTransport.setImageUrl(transport.getImageUrl());
            
            Transport savedClone = transportRepository.save(clonedTransport);
            finalTransportId = savedClone.getId();
        } else {
            // First time assignment or Re-assignment to the same trip
            if (transport.getTripId() == null || !transport.getTripId().equals(tripId)) {
                transport.setTripId(tripId);
                transportRepository.save(transport);
            }
        }

        if (!trip.getTransportIds().contains(finalTransportId)) {
            trip.getTransportIds().add(finalTransportId);
            repository.save(trip);
        }
    }

    @Override
    public void addItineraryToTrip(String tripId, String itineraryId) {
        Trip trip = findById(tripId);
        TripItinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Itinerary not found"));

        if (!trip.getItineraryIds().contains(itineraryId)) {
            trip.getItineraryIds().add(itineraryId);
            repository.save(trip);
        }

        if (itinerary.getTripId() == null || !itinerary.getTripId().equals(tripId)) {
            itinerary.setTripId(tripId);
            itineraryRepository.save(itinerary);
        }
    }

    private void mapDtoToEntity(TripDTO dto, Trip trip) {
        if (dto.getTitle() != null)
            trip.setTitle(dto.getTitle());
        if (dto.getDestination() != null)
            trip.setDestination(dto.getDestination());
        if (dto.getStartDate() != null)
            trip.setStartDate(dto.getStartDate());
        if (dto.getEndDate() != null)
            trip.setEndDate(dto.getEndDate());
        if (dto.getDifficulty() != null)
            trip.setDifficulty(dto.getDifficulty());
        if (dto.getTotalBudget() != null)
            trip.setTotalBudget(dto.getTotalBudget());
        if (dto.getStatus() != null)
            trip.setStatus(dto.getStatus());
        if (dto.getUserId() != null)
            trip.setUserId(dto.getUserId());
        if (dto.getRouteOptimizationId() != null)
            trip.setRouteOptimizationId(dto.getRouteOptimizationId());
        if (dto.getItineraryIds() != null)
            trip.setItineraryIds(dto.getItineraryIds());
        if (dto.getTransportIds() != null)
            trip.setTransportIds(dto.getTransportIds());

        // New fields
        trip.setParticipants(dto.getParticipants());
        if (dto.getComfortLevel() != null)
            trip.setComfortLevel(dto.getComfortLevel());
        if (dto.getActivities() != null)
            trip.setActivities(dto.getActivities());
        if (dto.getImageUrl() != null)
            trip.setImageUrl(dto.getImageUrl());
        trip.setTemplate(dto.isTemplate());
    }

    @Override
    public java.util.List<com.campconnect.trip.entity.Trip> searchByKeywords(String query) {
        return repository.findByTitleContainingIgnoreCaseOrDestinationAddressContainingIgnoreCase(query, query);
    }

    @Override
    public java.util.List<com.campconnect.trip.entity.Trip> searchByCriteria(String difficulty, String address) {
        com.campconnect.trip.enums.DifficultyLevel level = com.campconnect.trip.enums.DifficultyLevel.valueOf(difficulty.toUpperCase());
        return repository.findByDifficultyAndDestinationAddressContainingIgnoreCase(level, address);
    }

    @Override
    public List<java.util.Map<String, Object>> getDifficultyStats() {
        return repository.getTripStatsByDifficulty();
    }

    @Override
    public Set<String> getDatabaseCollections() {
        return mongoTemplate.getCollectionNames();
    }
}
