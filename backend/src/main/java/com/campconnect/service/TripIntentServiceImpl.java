package com.campconnect.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.campconnect.model.Group;
import com.campconnect.model.GroupStatus;
import com.campconnect.model.TripIntent;
import com.campconnect.model.TripIntentStatus;
import com.campconnect.repository.TripIntentRepository;

import com.campconnect.trip.service.ITripService;
import com.campconnect.trip.dto.TripDTO;
import com.campconnect.trip.enums.DifficultyLevel;
import com.campconnect.trip.enums.TripStatus;
import org.springframework.beans.factory.annotation.Qualifier;
import java.time.ZoneOffset;
import java.math.BigDecimal;

@Service
public class TripIntentServiceImpl implements ITripIntentService {

    private final TripIntentRepository tripIntentRepository;
    private final IGroupService groupService;
    private final ITripService itineraryTripService;

    public TripIntentServiceImpl(
            TripIntentRepository tripIntentRepository,
            IGroupService groupService,
            @Qualifier("itineraryTripService") ITripService itineraryTripService) {
        this.tripIntentRepository = tripIntentRepository;
        this.groupService = groupService;
        this.itineraryTripService = itineraryTripService;
    }

    @Override
    public TripIntent createTripIntent(TripIntent tripIntent) {
        tripIntent.setCreatedAt(LocalDateTime.now());
        if (tripIntent.getStatus() == null) {
            tripIntent.setStatus(TripIntentStatus.OPEN);
        }
        
        TripIntent savedTrip = tripIntentRepository.save(tripIntent);
        
        // Ensure a group is created
        Group group = new Group();
        group.setTripId(savedTrip.getId());
        group.setName(savedTrip.getTitle());
        group.setCreatorUserId(savedTrip.getCreatorUserId());
        group.setStatus(GroupStatus.ACTIVE);
        group.setMemberUserIds(new java.util.ArrayList<>());
        group.getMemberUserIds().add(savedTrip.getCreatorUserId());
        
        groupService.createGroup(group);
        System.out.println("Auto-created group for trip intent: " + savedTrip.getId());
        
        // Ensure a Trip entity is created for "My Trips"
        try {
            TripDTO tripDto = new TripDTO();
            tripDto.setId(savedTrip.getId()); // Use same ID as the intent/group
            tripDto.setTitle(savedTrip.getTitle());
            tripDto.setUserId(savedTrip.getCreatorUserId());
            tripDto.setStartDate(savedTrip.getDateFrom().toInstant(ZoneOffset.UTC));
            tripDto.setEndDate(savedTrip.getDateTo().toInstant(ZoneOffset.UTC));
            tripDto.setTotalBudget(BigDecimal.valueOf(savedTrip.getBudgetMax() != null ? savedTrip.getBudgetMax() : 0));
            tripDto.setStatus(TripStatus.PLANNED);
            tripDto.setParticipants(1); // Default for creator
            
            // Map destination (TripIntent preferredZone -> LocationPoint address)
            com.campconnect.model.common.LocationPoint location = new com.campconnect.model.common.LocationPoint();
            location.setAddress(savedTrip.getPreferredZone() != null ? savedTrip.getPreferredZone() : "Unknown Destination");
            location.setLatitude(0.0);
            location.setLongitude(0.0);
            tripDto.setDestination(location);
            
            // Map ExperienceLevel to DifficultyLevel
            if (savedTrip.getExperienceLevel() != null) {
                switch (savedTrip.getExperienceLevel()) {
                    case "BEGINNER": tripDto.setDifficulty(DifficultyLevel.BEGINNER); break;
                    case "ADVANCED": tripDto.setDifficulty(DifficultyLevel.HARD); break;
                    case "EXPERT": tripDto.setDifficulty(DifficultyLevel.EXPERT); break;
                    default: tripDto.setDifficulty(DifficultyLevel.MODERATE); break;
                }
            } else {
                tripDto.setDifficulty(DifficultyLevel.MODERATE);
            }
            
            itineraryTripService.save(tripDto);
            System.out.println("Auto-created Trip entity for intent: " + savedTrip.getId());
        } catch (Exception e) {
            System.err.println("Failed to auto-create Trip entity: " + e.getMessage());
        }
        
        return savedTrip;
    }

    @Override
    public TripIntent getTripIntentById(String id) {
        return tripIntentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("TripIntent not found with id: " + id));
    }

    @Override
    public List<TripIntent> getTripIntentsByCreator(String creatorUserId) {
        return tripIntentRepository.findByCreatorUserId(creatorUserId);
    }

    @Override
    public List<TripIntent> getAllOpenTripIntents() {
        return tripIntentRepository.findByStatus(TripIntentStatus.OPEN);
    }

    @Override
    public TripIntent updateTripIntent(String id, TripIntent tripIntent) {
        TripIntent existing = getTripIntentById(id);

        existing.setTitle(tripIntent.getTitle());
        existing.setDateFrom(tripIntent.getDateFrom());
        existing.setDateTo(tripIntent.getDateTo());
        existing.setBudgetMax(tripIntent.getBudgetMax());
        existing.setCampingStyle(tripIntent.getCampingStyle());
        existing.setExperienceLevel(tripIntent.getExperienceLevel());
        existing.setPreferredZone(tripIntent.getPreferredZone());
        existing.setStatus(tripIntent.getStatus());

        TripIntent updated = tripIntentRepository.save(existing);
        
        // Sync with Group name
        groupService.getGroupByTripId(id).ifPresent(group -> {
            boolean modified = false;
            if (!group.getName().equals(updated.getTitle())) {
                group.setName(updated.getTitle());
                modified = true;
            }
            if (updated.getStatus() == TripIntentStatus.CLOSED) {
                group.setStatus(GroupStatus.INACTIVE);
                modified = true;
            }
            if (modified) {
                groupService.updateGroup(group.getId(), group);
            }
        });
        
        return updated;
    }

    @Override
    public void deleteTripIntent(String id) {
        TripIntent existing = getTripIntentById(id);
        existing.setStatus(TripIntentStatus.CLOSED);
        tripIntentRepository.save(existing);
    }
}
