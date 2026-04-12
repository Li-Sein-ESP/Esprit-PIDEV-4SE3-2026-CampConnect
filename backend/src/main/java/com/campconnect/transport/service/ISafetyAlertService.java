package com.campconnect.transport.service;

import com.campconnect.transport.dto.SafetyAlertDTO;
import com.campconnect.transport.entity.SafetyAlert;
import java.util.List;

public interface ISafetyAlertService {
    List<SafetyAlert> findAll();

    SafetyAlert findById(String id);

    SafetyAlert save(SafetyAlertDTO dto);

    SafetyAlert update(String id, SafetyAlertDTO dto);

    void delete(String id);

    List<SafetyAlert> findByRouteSegmentId(String routeSegmentId);

    void assignToSegment(String alertId, String segmentId);
}
