package com.campconnect.controller;

import com.campconnect.dto.ConnectionDto;
import com.campconnect.model.ConnectionRequest;
import com.campconnect.model.ConnectionRequestStatus;
import com.campconnect.service.ConnectionRequestServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/connections")
@RequiredArgsConstructor
public class ConnectionRequestController {

    private final ConnectionRequestServiceImpl service;

    // ── CREATE ────────────────────────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<ConnectionRequest> sendRequest(@Valid @RequestBody ConnectionDto dto) {
        ConnectionRequest request = new ConnectionRequest();
        request.setFromUserId(dto.getFromUserId());
        request.setFromUserName(dto.getFromUserName());
        request.setFromUserAvatar(dto.getFromUserAvatar());
        request.setToUserId(dto.getToUserId());
        request.setToUserName(dto.getToUserName());
        request.setToUserAvatar(dto.getToUserAvatar());
        request.setCampingStyle(dto.getCampingStyle());
        request.setExperienceLevel(dto.getExperienceLevel());
        request.setMatchScore(dto.getMatchScore());
        request.setMessage(dto.getMessage());
        ConnectionRequest sentRequest = service.sendRequest(request);
        return new ResponseEntity<>(sentRequest, HttpStatus.CREATED);
    }

    // ── READ ──────────────────────────────────────────────────────────────────

    @GetMapping("/received/{userId}")
    public ResponseEntity<List<ConnectionRequest>> getReceivedRequests(@PathVariable String userId) {
        List<ConnectionRequest> received = service.getReceived(userId);
        return ResponseEntity.ok(received);
    }

    @GetMapping("/sent/{userId}")
    public ResponseEntity<List<ConnectionRequest>> getSentRequests(@PathVariable String userId) {
        List<ConnectionRequest> sent = service.getSent(userId);
        return ResponseEntity.ok(sent);
    }

    @GetMapping("/accepted/{userId}")
    public ResponseEntity<List<ConnectionRequest>> getAcceptedConnections(@PathVariable String userId) {
        List<ConnectionRequest> accepted = service.getAccepted(userId);
        return ResponseEntity.ok(accepted);
    }

    @GetMapping("/pending-count/{userId}")
    public ResponseEntity<Map<String, Long>> getPendingCount(@PathVariable String userId) {
        long count = service.getPendingCount(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    @GetMapping("/status/{fromUserId}/{toUserId}")
    public ResponseEntity<Map<String, String>> getRequestStatus(
            @PathVariable String fromUserId,
            @PathVariable String toUserId) {
        ConnectionRequestStatus status = service.getStatusTo(fromUserId, toUserId);
        if (status == null) {
            return ResponseEntity.ok(Map.of("status", "none"));
        }
        return ResponseEntity.ok(Map.of("status", status.name()));
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────

    @PutMapping("/{id}/accept")
    public ResponseEntity<ConnectionRequest> acceptRequest(@PathVariable String id) {
        ConnectionRequest accepted = service.acceptRequest(id);
        return ResponseEntity.ok(accepted);
    }

    @PutMapping("/{id}/decline")
    public ResponseEntity<ConnectionRequest> declineRequest(@PathVariable String id) {
        ConnectionRequest declined = service.declineRequest(id);
        return ResponseEntity.ok(declined);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ConnectionRequest> cancelRequest(@PathVariable String id) {
        ConnectionRequest cancelled = service.cancelRequest(id);
        return ResponseEntity.ok(cancelled);
    }

    // ── DELETE ────────────────────────────────────────────────────────────────

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> unmatch(@PathVariable String id) {
        service.unmatch(id);
        return ResponseEntity.noContent().build();
    }

}
