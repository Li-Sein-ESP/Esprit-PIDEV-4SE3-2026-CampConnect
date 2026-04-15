package com.campconnect.transport.service.impl;

import com.campconnect.transport.dto.SafetyAlertDTO;
import com.campconnect.transport.entity.SafetyAlert;
import com.campconnect.transport.repository.SafetyAlertRepository;
import com.campconnect.transport.service.ISafetyAlertService;
import com.campconnect.trip.repository.RouteSegmentRepository;
import com.campconnect.trip.entity.RouteSegment;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.UUID;

@Service("transportSafetyAlertService")
public class SafetyAlertServiceImpl implements ISafetyAlertService {
    private final SafetyAlertRepository repository;
    private final RouteSegmentRepository routeSegmentRepository;

    public SafetyAlertServiceImpl(
            @Qualifier("transportSafetyAlertRepository") SafetyAlertRepository repository,
            RouteSegmentRepository routeSegmentRepository) {
        this.repository = repository;
        this.routeSegmentRepository = routeSegmentRepository;
    }

    @Override
    public List<SafetyAlert> findAll() {
        return repository.findAll();
    }

    @Override
    public SafetyAlert findById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "SafetyAlert not found"));
    }

    @Override
    public SafetyAlert save(SafetyAlertDTO dto) {
        SafetyAlert entity = new SafetyAlert();
        if (dto.getId() != null && !dto.getId().isEmpty()) {
            entity.setId(dto.getId());
        } else {
            entity.setId(UUID.randomUUID().toString());
        }
        mapDtoToEntity(dto, entity);
        return repository.save(entity);
    }

    @Override
    public SafetyAlert update(String id, SafetyAlertDTO dto) {
        SafetyAlert entity = findById(id);
        mapDtoToEntity(dto, entity);
        return repository.save(entity);
    }

    @Override
    public void delete(String id) {
        if (!repository.existsById(id))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "SafetyAlert not found");
        repository.deleteById(id);
    }

    @Override
    public List<SafetyAlert> findByRouteSegmentId(String routeSegmentId) {
        return repository.findByRouteSegmentId(routeSegmentId);
    }

    @Override
    public void assignToSegment(String alertId, String segmentId) {
        SafetyAlert alert = findById(alertId);
        RouteSegment segment = routeSegmentRepository.findById(segmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Route Segment not found"));

        if (alert.getRouteSegmentId() == null || !alert.getRouteSegmentId().equals(segmentId)) {
            alert.setRouteSegmentId(segmentId);
            repository.save(alert);
        }

        if (!segment.getSafetyAlertIds().contains(alertId)) {
            segment.getSafetyAlertIds().add(alertId);
            routeSegmentRepository.save(segment);
        }
    }

    private void mapDtoToEntity(SafetyAlertDTO dto, SafetyAlert entity) {
        if (dto.getRouteSegmentId() != null)
            entity.setRouteSegmentId(dto.getRouteSegmentId());
        if (dto.getTitle() != null)
            entity.setTitle(dto.getTitle());
        if (dto.getDescription() != null)
            entity.setDescription(dto.getDescription());
        if (dto.getSeverity() != null)
            entity.setSeverity(dto.getSeverity());
        // createdAt is auto-set in SafetyAlert constructor and must not be overwritten
    }
}
