package com.campconnect.transport.service;

import com.campconnect.transport.dto.TransportDTO;
import com.campconnect.transport.entity.Transport;
import java.util.List;

public interface ITransportService {
    List<Transport> findAll();

    Transport findById(String id);

    Transport save(TransportDTO dto);

    Transport update(String id, TransportDTO dto);

    void delete(String id);

    List<Transport> findByTripId(String tripId);

    void assignToTrip(String transportId, String tripId);
}
