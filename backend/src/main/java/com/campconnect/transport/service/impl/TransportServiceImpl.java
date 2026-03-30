package com.campconnect.transport.service.impl;

import com.campconnect.transport.dto.TransportDTO;
import com.campconnect.transport.entity.Transport;
import com.campconnect.transport.repository.TransportRepository;
import com.campconnect.transport.service.ITransportService;
import com.campconnect.trip.repository.TripRepository;
import com.campconnect.trip.entity.Trip;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TransportServiceImpl implements ITransportService {

    private final TransportRepository repository;
    private final TripRepository tripRepository;

    @Override
    public List<Transport> findAll() {
        return repository.findAll();
    }

    @Override
    public Transport findById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Transport not found with id: " + id));
    }

    @Override
    public Transport save(TransportDTO dto) {
        Transport transport = new Transport();
        if (dto.getId() != null && !dto.getId().isEmpty()) {
            transport.setId(dto.getId());
        } else {
            transport.setId(UUID.randomUUID().toString());
        }
        mapDtoToEntity(dto, transport);
        Transport saved = repository.save(transport);

        // Synchronize with Trip if a tripId is provided
        if (saved.getTripId() != null) {
            linkTransportToTrip(saved.getId(), saved.getTripId());
        }

        return saved;
    }

    @Override
    public Transport update(String id, TransportDTO dto) {
        Transport transport = findById(id);
        String oldTripId = transport.getTripId();
        mapDtoToEntity(dto, transport);
        Transport updated = repository.save(transport);

        // If trip assignment changed, update links
        if (updated.getTripId() != null && !updated.getTripId().equals(oldTripId)) {
            linkTransportToTrip(updated.getId(), updated.getTripId());
        }

        return updated;
    }

    private void linkTransportToTrip(String transportId, String tripId) {
        tripRepository.findById(tripId).ifPresent(trip -> {
            if (!trip.getTransportIds().contains(transportId)) {
                trip.getTransportIds().add(transportId);
                tripRepository.save(trip);
            }
        });
    }

    @Override
    public void delete(String id) {
        Transport transport = repository.findById(id).orElse(null);
        if (transport != null && transport.getTripId() != null) {
            tripRepository.findById(transport.getTripId()).ifPresent(trip -> {
                trip.getTransportIds().remove(id);
                tripRepository.save(trip);
            });
        }
        repository.deleteById(id);
    }

    @Override
    public List<Transport> findByTripId(String tripId) {
        return repository.findByTripId(tripId);
    }

    @Override
    public void assignToTrip(String transportId, String tripId) {
        Transport transport = findById(transportId);
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trip not found"));

        if (transport.getTripId() == null || !transport.getTripId().equals(tripId)) {
            transport.setTripId(tripId);
            repository.save(transport);
        }

        if (!trip.getTransportIds().contains(transportId)) {
            trip.getTransportIds().add(transportId);
            tripRepository.save(trip);
        }
    }

    private void mapDtoToEntity(TransportDTO dto, Transport transport) {
        if (dto.getTripId() != null)
            transport.setTripId(dto.getTripId());
        if (dto.getRouteSegmentId() != null)
            transport.setRouteSegmentId(dto.getRouteSegmentId());
        if (dto.getMode() != null)
            transport.setMode(dto.getMode());
        if (dto.getCost() != null)
            transport.setCost(dto.getCost());
        if (dto.getDuration() > 0)
            transport.setDuration(dto.getDuration());
        if (dto.getProvider() != null)
            transport.setProvider(dto.getProvider());
        if (dto.getImageUrl() != null)
            transport.setImageUrl(dto.getImageUrl());
    }
}
