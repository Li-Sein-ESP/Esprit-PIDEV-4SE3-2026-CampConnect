package com.campconnect.repository;

import com.campconnect.model.ConnectionRequest;
import com.campconnect.model.ConnectionRequestStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConnectionRequestRepository extends MongoRepository<ConnectionRequest, String> {

    // Requests received by the user that have a specific status (e.g., PENDING)
    List<ConnectionRequest> findByToUserIdAndStatus(String toUserId, ConnectionRequestStatus status);

    // Requests sent by the user that are NOT in a specific status (e.g., not
    // CANCELLED)
    List<ConnectionRequest> findByFromUserIdAndStatusNot(String fromUserId, ConnectionRequestStatus status);

    // Count of pending requests for a user
    long countByToUserIdAndStatus(String toUserId, ConnectionRequestStatus status);

    // Get a specific connection request between two users
    Optional<ConnectionRequest> findByFromUserIdAndToUserId(String fromUserId, String toUserId);

    // All accepted connections involving the current user (either sender or
    // receiver)
    @Query("{$and: [{$or: [{'fromUserId': ?0}, {'toUserId': ?0}]}, {'status': ?1}]}")
    List<ConnectionRequest> findAcceptedConnections(String userId, ConnectionRequestStatus status);
    List<ConnectionRequest> findByFromUserIdOrToUserIdOrderByCreatedAtDesc(
            String fromUserId,
            String toUserId
    );
}
