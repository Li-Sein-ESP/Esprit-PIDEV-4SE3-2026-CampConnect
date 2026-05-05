package com.campconnect.service;

import java.util.List;

import com.campconnect.dto.GroupInviteDetailDto;
import com.campconnect.model.GroupInvite;

public interface IGroupInviteService {
    GroupInvite createInvite(GroupInvite invite);
    GroupInvite acceptInvite(String id, String reason, Boolean helpful);
    GroupInvite declineInvite(String id, String reason, Boolean helpful);
    GroupInvite cancelInvite(String id);
    List<GroupInvite> getInvitesForUser(String userId);
    List<GroupInvite> getInvitesByFromUser(String userId);
    GroupInvite getInviteById(String id);
    
    // Aggregation methods
    List<GroupInviteDetailDto> getInviteDetailsForUser(String userId);
    List<GroupInviteDetailDto> getInviteDetailsFromUser(String userId);
}
