package com.campconnect.service;

import com.campconnect.model.ConnectionRequest;
import com.campconnect.model.ConnectionRequestStatus;
import com.campconnect.repository.ConnectionRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ConnectionRequestServiceImpl implements IConnectionRequestService {


    private final ConnectionRequestRepository repository;

    // ── Public APIs ─────────────────────────────────────────────────────────

    public List<ConnectionRequest> getReceived(String userId) {
        return repository.findByToUserIdAndStatus(userId, ConnectionRequestStatus.PENDING);
    }

    public List<ConnectionRequest> getSent(String userId) {
        return repository.findByFromUserIdAndStatusNot(userId, ConnectionRequestStatus.CANCELLED);
    }

    public List<ConnectionRequest> getAccepted(String userId) {
        return repository.findAcceptedConnections(userId, ConnectionRequestStatus.ACCEPTED);
    }

    public long getPendingCount(String userId) {
        return repository.countByToUserIdAndStatus(userId, ConnectionRequestStatus.PENDING);
    }

    public ConnectionRequestStatus getStatusTo(String fromUserId, String toUserId) {
        Optional<ConnectionRequest> request = repository.findByFromUserIdAndToUserId(fromUserId, toUserId);
        return request.map(ConnectionRequest::getStatus).orElse(null);
    }

    // ── CREATE ────────────────────────────────────────────────────────────────

    public ConnectionRequest sendRequest(ConnectionRequest request) {
        // Prevent duplicates
        Optional<ConnectionRequest> existing = repository.findByFromUserIdAndToUserId(
                request.getFromUserId(), request.getToUserId());

        if (existing.isPresent() && existing.get().getStatus() == ConnectionRequestStatus.PENDING) {
            return existing.get();
        }

        request.setCreatedAt(LocalDateTime.now());
        request.setUpdatedAt(LocalDateTime.now());
        request.setStatus(ConnectionRequestStatus.PENDING);

        return repository.save(request);
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────

    public ConnectionRequest acceptRequest(String id) {
        return updateStatus(id, ConnectionRequestStatus.ACCEPTED);
    }

    public ConnectionRequest declineRequest(String id) {
        return updateStatus(id, ConnectionRequestStatus.DECLINED);
    }

    public ConnectionRequest cancelRequest(String id) {
        return updateStatus(id, ConnectionRequestStatus.CANCELLED);
    }

    // ── DELETE ────────────────────────────────────────────────────────────────

    public void unmatch(String id) {
        repository.deleteById(id);
    }

    // ── Private Helpers ───────────────────────────────────────────────────────

    private ConnectionRequest updateStatus(String id, ConnectionRequestStatus status) {
        ConnectionRequest request = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("ConnectionRequest not found with id: " + id));

        request.setStatus(status);
        request.setUpdatedAt(LocalDateTime.now());
        return repository.save(request);
    }

}
