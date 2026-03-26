package com.campconnect.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.campconnect.model.Group;
import com.campconnect.model.GroupStatus;
import com.campconnect.model.TripIntent;
import com.campconnect.model.TripIntentStatus;
import com.campconnect.repository.TripIntentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TripIntentServiceImpl implements ITripIntentService {

    private final TripIntentRepository tripIntentRepository;
    private final IGroupService groupService;

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
        System.out.println("Auto-created group for trip: " + savedTrip.getId());
        
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
