package com.campconnect.service;

import com.campconnect.model.ConnectionRequest;
import com.campconnect.model.ConnectionRequestStatus;

import java.util.List;

public interface IConnectionRequestService {

    // READ
    List<ConnectionRequest> getReceived(String userId);

    List<ConnectionRequest> getSent(String userId);

    List<ConnectionRequest> getAccepted(String userId);

    long getPendingCount(String userId);

    ConnectionRequestStatus getStatusTo(String fromUserId, String toUserId);

    // CREATE
    ConnectionRequest sendRequest(ConnectionRequest request);

    // UPDATE
    ConnectionRequest acceptRequest(String id);

    ConnectionRequest declineRequest(String id);

    ConnectionRequest cancelRequest(String id);

    // DELETE
    void unmatch(String id);

}