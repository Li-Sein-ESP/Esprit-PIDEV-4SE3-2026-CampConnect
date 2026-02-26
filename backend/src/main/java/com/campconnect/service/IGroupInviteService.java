package com.campconnect.service;

import java.util.List;

import com.campconnect.model.GroupInvite;

public interface IGroupInviteService {
    GroupInvite sendInvite(GroupInvite invite);

    GroupInvite getInviteById(String id);

    List<GroupInvite> getInvitesForUser(String userId);

    List<GroupInvite> getInvitesForGroup(String groupId);

    GroupInvite acceptInvite(String id);

    GroupInvite declineInvite(String id);

    void cancelInvite(String id);
}
