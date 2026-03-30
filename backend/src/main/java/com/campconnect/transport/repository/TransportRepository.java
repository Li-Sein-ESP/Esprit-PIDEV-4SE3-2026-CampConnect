package com.campconnect.transport.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.campconnect.transport.entity.Transport;
import java.util.List;

public interface TransportRepository extends MongoRepository<Transport, String> {
    List<Transport> findByTripId(String tripId);
}
