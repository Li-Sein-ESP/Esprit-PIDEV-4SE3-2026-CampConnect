package com.campconnect.service;

import java.util.List;

import com.campconnect.dto.GroupInviteDetailDTO;
import com.campconnect.model.GroupInvite;

public interface IGroupInviteService {
    GroupInvite createInvite(GroupInvite invite);
    GroupInvite acceptInvite(String id);
    GroupInvite declineInvite(String id);
    GroupInvite cancelInvite(String id);
    List<GroupInvite> getInvitesForUser(String userId);
    List<GroupInvite> getInvitesByFromUser(String userId);
    GroupInvite getInviteById(String id);
    
    // Aggregation methods
    List<GroupInviteDetailDTO> getInviteDetailsForUser(String userId);
    List<GroupInviteDetailDTO> getInviteDetailsFromUser(String userId);
}
