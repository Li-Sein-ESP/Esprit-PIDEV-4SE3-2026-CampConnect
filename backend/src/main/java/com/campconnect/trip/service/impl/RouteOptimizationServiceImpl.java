package com.campconnect.trip.service.impl;

import com.campconnect.trip.dto.RouteOptimizationDTO;
import com.campconnect.trip.entity.RouteOptimization;
import com.campconnect.trip.entity.Trip;
import com.campconnect.trip.repository.RouteOptimizationRepository;
import com.campconnect.trip.repository.TripRepository;
import com.campconnect.trip.service.IRouteOptimizationService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RouteOptimizationServiceImpl implements IRouteOptimizationService {
    private final RouteOptimizationRepository repository;
    private final TripRepository tripRepository;

    @Override
    public List<RouteOptimization> findAll() {
        return repository.findAll();
    }

    @Override
    public RouteOptimization findById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Optimization not found"));
    }

    @Override
    public RouteOptimization save(RouteOptimizationDTO dto) {
        RouteOptimization entity = new RouteOptimization();
        if (dto.getId() != null && !dto.getId().isEmpty()) {
            entity.setId(dto.getId());
        } else {
            entity.setId(UUID.randomUUID().toString());
        }
        mapDtoToEntity(dto, entity);
        return repository.save(entity);
    }

    @Override
    public RouteOptimization update(String id, RouteOptimizationDTO dto) {
        RouteOptimization entity = findById(id);
        mapDtoToEntity(dto, entity);
        return repository.save(entity);
    }

    @Override
    public void delete(String id) {
        if (!repository.existsById(id))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Optimization not found");
        repository.deleteById(id);
    }

    @Override
    public RouteOptimization findByTripId(String tripId) {
        return repository.findByTripId(tripId).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Optimization not found for trip"));
    }

    @Override
    public void assignToTrip(String optimizationId, String tripId) {
        RouteOptimization optimization = findById(optimizationId);
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trip not found"));

        if (optimization.getTripId() == null || !optimization.getTripId().equals(tripId)) {
            optimization.setTripId(tripId);
            repository.save(optimization);
        }

        if (trip.getRouteOptimizationId() == null || !trip.getRouteOptimizationId().equals(optimizationId)) {
            trip.setRouteOptimizationId(optimizationId);
            tripRepository.save(trip);
        }
    }

    private void mapDtoToEntity(RouteOptimizationDTO dto, RouteOptimization entity) {
        if (dto.getTripId() != null)
            entity.setTripId(dto.getTripId());
        if (dto.getTotalDuration() > 0)
            entity.setTotalDuration(dto.getTotalDuration());
        if (dto.getTotalCost() != null)
            entity.setTotalCost(dto.getTotalCost());
    }
}
