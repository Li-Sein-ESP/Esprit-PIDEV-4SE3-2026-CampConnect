package com.campconnect.transport.service.impl;

import com.campconnect.transport.dto.TransportDTO;
import com.campconnect.transport.dto.TransportDelayTestRequest;
import com.campconnect.transport.entity.Transport;
import com.campconnect.transport.enums.TransportStatus;
import com.campconnect.transport.repository.TransportRepository;
import com.campconnect.transport.service.ITransportService;
import com.campconnect.trip.repository.TripRepository;
import com.campconnect.trip.entity.Trip;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import lombok.RequiredArgsConstructor;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
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
        return repository.save(transport);
    }

    @Override
    public Transport update(String id, TransportDTO dto) {
        Transport transport = findById(id); // throws 404 if not found
        mapDtoToEntity(dto, transport);
        return repository.save(transport);
    }

    @Override
    public void delete(String id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Transport not found with id: " + id);
        }
        repository.deleteById(id);
    }

    /**
     * Transports rattachés au voyage : par champ {@code tripId} sur le document transport,
     * et par les {@code transportIds} stockés sur le voyage (les deux doivent rester alignés).
     * Si un transport n'a pas encore {@code tripId} mais figure sur le voyage, on répare le lien.
     */
    @Override
    public List<Transport> findByTripId(String tripId) {
        Map<String, Transport> merged = new LinkedHashMap<>();
        for (Transport t : repository.findByTripId(tripId)) {
            if (t != null && t.getId() != null) {
                merged.put(t.getId(), t);
            }
        }
        tripRepository.findById(tripId).ifPresent(trip -> {
            List<String> ids = trip.getTransportIds();
            if (ids == null) {
                return;
            }
            for (String tid : ids) {
                if (tid == null || tid.isBlank()) {
                    continue;
                }
                Transport existing = merged.get(tid);
                if (existing != null) {
                    merged.put(tid, ensureTransportLinkedToTrip(existing, tripId));
                } else {
                    repository.findById(tid).ifPresent(tr -> merged.put(tr.getId(), ensureTransportLinkedToTrip(tr, tripId)));
                }
            }
        });
        return new ArrayList<>(merged.values());
    }

    private Transport ensureTransportLinkedToTrip(Transport tr, String tripId) {
        if (tripId != null && (tr.getTripId() == null || !tripId.equals(tr.getTripId()))) {
            tr.setTripId(tripId);
            return repository.save(tr);
        }
        return tr;
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

    @Override
    public java.util.List<java.util.Map<String, Object>> getPopularityStats() {
        return repository.getTransportPopularityStats();
    }

    @Override
    public Transport applyDelayForTesting(String id, TransportDelayTestRequest body) {
        Transport t = findById(id);
        int dm = body != null ? body.getDelayMinutes() : 0;
        if (dm <= 0) {
            t.setStatus(TransportStatus.AVAILABLE);
            t.setDelayMinutes(0);
        } else {
            t.setStatus(TransportStatus.DELAYED);
            t.setDelayMinutes(dm);
        }
        if (body != null && body.getDepartureTime() != null) {
            t.setDepartureTime(body.getDepartureTime());
        }
        return repository.save(t);
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
