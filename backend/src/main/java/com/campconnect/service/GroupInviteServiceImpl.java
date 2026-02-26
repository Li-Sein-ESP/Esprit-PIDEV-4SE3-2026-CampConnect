package com.campconnect.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.campconnect.model.Group;
import com.campconnect.model.GroupInvite;
import com.campconnect.model.GroupInviteStatus;
import com.campconnect.model.GroupStatus;
import com.campconnect.repository.GroupInviteRepository;
import com.campconnect.repository.GroupRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GroupInviteServiceImpl implements IGroupInviteService {

    private final GroupInviteRepository groupInviteRepository;
    private final GroupRepository groupRepository;

    @Override
    public GroupInvite sendInvite(GroupInvite invite) {
        invite.setCreatedAt(LocalDateTime.now());
        invite.setStatus(GroupInviteStatus.PENDING);
        if (invite.getExpiresAt() == null) {
            invite.setExpiresAt(LocalDateTime.now().plusDays(7));
        }
        return groupInviteRepository.save(invite);
    }

    @Override
    public GroupInvite getInviteById(String id) {
        return groupInviteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("GroupInvite not found with id: " + id));
    }

    @Override
    public List<GroupInvite> getInvitesForUser(String userId) {
        return groupInviteRepository.findByToUserId(userId);
    }

    @Override
    public List<GroupInvite> getInvitesForGroup(String groupId) {
        return groupInviteRepository.findByGroupId(groupId);
    }

    @Override
    public GroupInvite acceptInvite(String id) {
        GroupInvite invite = getInviteById(id);
        invite.setStatus(GroupInviteStatus.ACCEPTED);

        // Update Group members
        Group group = groupRepository.findById(invite.getGroupId())
                .orElseThrow(() -> new RuntimeException("Group not found with id: " + invite.getGroupId()));

        if (!group.getMemberUserIds().contains(invite.getToUserId())) {
            group.getMemberUserIds().add(invite.getToUserId());

            // Activate group if enough members (e.g., creator + 1)
            if (group.getMemberUserIds().size() >= 2) {
                group.setStatus(GroupStatus.ACTIVE);
            }

            groupRepository.save(group);
        }

        return groupInviteRepository.save(invite);
    }

    @Override
    public GroupInvite declineInvite(String id) {
        GroupInvite invite = getInviteById(id);
        invite.setStatus(GroupInviteStatus.DECLINED);
        return groupInviteRepository.save(invite);
    }

    @Override
    public void cancelInvite(String id) {
        GroupInvite invite = getInviteById(id);
        invite.setStatus(GroupInviteStatus.CANCELLED);
        groupInviteRepository.save(invite);
    }
}
