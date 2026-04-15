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
import java.time.Instant;

@Service("itineraryTripService")
public class TripServiceImpl implements ITripService {

    private final TripRepository repository;
    private final TransportRepository transportRepository;
    private final TripItineraryRepository itineraryRepository;
    private final MongoTemplate mongoTemplate;
    private static final Logger logger = LoggerFactory.getLogger(TripServiceImpl.class);

    public TripServiceImpl(
            @Qualifier("itineraryTripRepository") TripRepository repository,
            TransportRepository transportRepository,
            TripItineraryRepository itineraryRepository,
            MongoTemplate mongoTemplate) {
        this.repository = repository;
        this.transportRepository = transportRepository;
        this.itineraryRepository = itineraryRepository;
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public List<Trip> findAll() {
        logger.info("[ADMIN_OMNI_SCAN] Starting full diagnostic discovery for Admin Portal");
        List<Trip> allFound = new ArrayList<>();
        
        try {
            java.util.Set<String> collections = mongoTemplate.getCollectionNames();
            logger.info("[ADMIN_OMNI_SCAN] Discovery phase active. Assessing {} collections.", collections.size());
            
            for (String col : collections) {
                // Ignore system, user, auth, and technical collections to reduce clutter
                if (col.startsWith("system.") || col.equals("users") || col.equals("roles") || col.equals("token") || col.endsWith("_logs")) {
                    continue;
                }
                
                try {
                    List<java.util.Map> raw = mongoTemplate.findAll(java.util.Map.class, col);
                    for (java.util.Map doc : raw) {
                        // Strict validation: must have a title or name, AND look like a trip document
                        boolean hasTripFields = doc.containsKey("title") || doc.containsKey("name");
                        boolean hasContextFields = doc.containsKey("destination") || doc.containsKey("startDate") || doc.containsKey("itineraryIds");
                        
                        if (hasTripFields && hasContextFields) {
                            Trip t = mapGenericDocToTrip(doc, col);
                            if (t != null) {
                                // If it was already in our main repository, let the distinct filter handle it later
                                allFound.add(t);
                            }
                        }
                    }
                } catch (Exception e) {}
            }
        } catch (Exception e) {
            logger.error("Admin Omni-Scan failed", e);
        }
        
        // If omni-scan found nothing, fallback to standard repository call
        if (allFound.isEmpty()) return repository.findAll();

        return allFound.stream()
            .filter(java.util.Objects::nonNull)
            .distinct()
            .collect(Collectors.toList());
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
        logger.info("[OMNI_SCAN] Commencing full database scan for ID: '{}'", userId);
        
        List<Trip> results = new ArrayList<>();
        String searchId = userId.trim();
        
        try {
            // Get EVERY collection name in the database
            java.util.Set<String> collections = mongoTemplate.getCollectionNames();
            logger.info("[OMNI_SCAN] Searching through {} collections", collections.size());

            for (String collectionName : collections) {
                // Skip system and huge non-trip collections
                if (collectionName.startsWith("system.") || collectionName.equals("users")) continue;

                logger.info("[OMNI_SCAN] Scanning collection: {}", collectionName);
                
                // Generic query: look for this ID in any common field
                Query query = new Query(new Criteria().orOperator(
                    Criteria.where("userId").is(searchId),
                    Criteria.where("creatorId").is(searchId),
                    Criteria.where("createdBy").is(searchId),
                    Criteria.where("_id").is(searchId),
                    Criteria.where("id").is(searchId),
                    Criteria.where("username").is(searchId)
                ));

                try {
                    // Search for documents as generic Maps to avoid POJO mapping errors
                    List<java.util.Map> rawDocs = mongoTemplate.find(query, java.util.Map.class, collectionName);
                    for (java.util.Map doc : rawDocs) {
                        Trip t = mapGenericDocToTrip(doc, collectionName);
                        if (t != null) results.add(t);
                    }
                } catch (Exception inner) {
                    logger.warn("[OMNI_SCAN] Could not scan {}: {}", collectionName, inner.getMessage());
                }
            }
        } catch (Exception e) {
            logger.error("[OMNI_SCAN] Critical failure", e);
        }
        
        logger.info("[OMNI_SCAN] Complete. Found {} potential missions.", results.size());
        
        return results.stream()
            .filter(java.util.Objects::nonNull)
            .distinct()
            .sorted((a, b) -> {
                Instant startA = a.getStartDate() != null ? a.getStartDate() : Instant.EPOCH;
                Instant startB = b.getStartDate() != null ? b.getStartDate() : Instant.EPOCH;
                return startB.compareTo(startA);
            })
            .collect(Collectors.toList());
    }

    private Trip mapGenericDocToTrip(java.util.Map doc, String collectionName) {
        try {
            Trip t = new Trip();
            Object id = doc.get("_id") != null ? doc.get("_id") : doc.get("id");
            t.setId(id != null ? id.toString() : java.util.UUID.randomUUID().toString());
            
            Object title = doc.get("title") != null ? doc.get("title") : (doc.get("name") != null ? doc.get("name") : "Recovered mission (" + collectionName + ")");
            t.setTitle(title.toString());
            
            Object uId = doc.get("userId") != null ? doc.get("userId") : (doc.get("creatorId") != null ? doc.get("creatorId") : null);
            t.setUserId(uId != null ? uId.toString() : null);
            
            // Map Dates
            if (doc.get("startDate") != null) {
                try {
                    Object sd = doc.get("startDate");
                    if (sd instanceof java.util.Date) {
                        t.setStartDate(((java.util.Date) sd).toInstant());
                    } else {
                        t.setStartDate(Instant.parse(sd.toString()));
                    }
                } catch (Exception e) {
                    System.out.println("Error parsing startDate: " + e.getMessage());
                }
            }
            if (doc.get("endDate") != null) {
                try {
                    Object ed = doc.get("endDate");
                    if (ed instanceof java.util.Date) {
                        t.setEndDate(((java.util.Date) ed).toInstant());
                    } else {
                        t.setEndDate(Instant.parse(ed.toString()));
                    }
                } catch (Exception e) {
                    System.out.println("Error parsing endDate: " + e.getMessage());
                }
            }
            
            // Map Destination
            Object dest = doc.get("destination");
            if (dest != null) {
                com.campconnect.model.common.LocationPoint lp = new com.campconnect.model.common.LocationPoint();
                if (dest instanceof java.util.Map) {
                    lp.setAddress(((java.util.Map) dest).get("address") != null ? ((java.util.Map) dest).get("address").toString() : "Address recovered");
                } else {
                    lp.setAddress(dest.toString());
                }
                t.setDestination(lp);
            }
            
            t.setStatus(com.campconnect.trip.enums.TripStatus.PLANNED);
            return t;
        } catch (Exception e) {
            return null;
        }
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
    public List<Trip> findTemplateTrips() {
        return repository.findByTemplate(true);
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
