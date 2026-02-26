package com.campconnect.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.campconnect.model.TripIntent;
import com.campconnect.model.TripIntentStatus;
import com.campconnect.repository.TripIntentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TripIntentServiceImpl implements ITripIntentService {

    private final TripIntentRepository tripIntentRepository;

    @Override
    public TripIntent createTripIntent(TripIntent tripIntent) {
        tripIntent.setCreatedAt(LocalDateTime.now());
        if (tripIntent.getStatus() == null) {
            tripIntent.setStatus(TripIntentStatus.OPEN);
        }
        return tripIntentRepository.save(tripIntent);
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

        return tripIntentRepository.save(existing);
    }

    @Override
    public void deleteTripIntent(String id) {
        tripIntentRepository.deleteById(id);
    }
}
