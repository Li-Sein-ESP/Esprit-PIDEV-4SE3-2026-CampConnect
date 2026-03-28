package com.campconnect.trip.service.impl;

import com.campconnect.trip.dto.TripDTO;
import com.campconnect.trip.entity.Trip;
import com.campconnect.trip.repository.TripRepository;
import com.campconnect.trip.service.ITripService;
import com.campconnect.trip.repository.TripItineraryRepository;
import com.campconnect.transport.repository.TransportRepository;
import com.campconnect.transport.entity.Transport;
import com.campconnect.trip.entity.TripItinerary;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TripServiceImpl implements ITripService {

    private final TripRepository repository;
    private final TransportRepository transportRepository;
    private final TripItineraryRepository itineraryRepository;

    @Override
    public List<Trip> findAll() {
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
        return repository.save(trip);
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
        return repository.findByUserId(userId);
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
}
