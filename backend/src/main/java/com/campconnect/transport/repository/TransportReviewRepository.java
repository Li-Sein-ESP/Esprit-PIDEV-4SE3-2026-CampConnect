package com.campconnect.transport.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.campconnect.transport.entity.TransportReview;
import java.util.List;

public interface TransportReviewRepository extends MongoRepository<TransportReview, String> {
    List<TransportReview> findByTransportId(String transportId);
}
