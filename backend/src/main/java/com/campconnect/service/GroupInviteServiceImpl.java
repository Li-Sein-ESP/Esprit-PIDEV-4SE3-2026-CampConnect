package com.campconnect.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

<<<<<<< HEAD
import com.campconnect.dto.GroupInviteDetailDto;
=======
import com.campconnect.dto.GroupInviteDetailDTO;
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
import com.campconnect.model.Group;
import com.campconnect.model.GroupInvite;
import com.campconnect.model.GroupInviteStatus;
import com.campconnect.model.GroupStatus;
import com.campconnect.repository.GroupInviteRepository;
import com.campconnect.repository.GroupRepository;
import com.campconnect.repository.TripIntentRepository;
import com.campconnect.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GroupInviteServiceImpl implements IGroupInviteService {

    private final GroupInviteRepository groupInviteRepository;
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    private final TripIntentRepository tripIntentRepository;

    @Override
    public GroupInvite createInvite(GroupInvite invite) {
        invite.setCreatedAt(LocalDateTime.now());
        invite.setStatus(GroupInviteStatus.PENDING);
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
    public List<GroupInvite> getInvitesByFromUser(String userId) {
        return groupInviteRepository.findByFromUserId(userId);
    }

    @Override
<<<<<<< HEAD
    public List<GroupInviteDetailDto> getInviteDetailsForUser(String userId) {
=======
    public List<GroupInviteDetailDTO> getInviteDetailsForUser(String userId) {
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
        List<GroupInvite> invites = getInvitesForUser(userId);
        return invites.stream().map(this::mapToDetailDto).toList();
    }

    @Override
<<<<<<< HEAD
    public List<GroupInviteDetailDto> getInviteDetailsFromUser(String userId) {
=======
    public List<GroupInviteDetailDTO> getInviteDetailsFromUser(String userId) {
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
        List<GroupInvite> invites = getInvitesByFromUser(userId);
        return invites.stream().map(this::mapToDetailDto).toList();
    }

<<<<<<< HEAD
    private GroupInviteDetailDto mapToDetailDto(GroupInvite invite) {
        GroupInviteDetailDto dto = new GroupInviteDetailDto();
=======
    private GroupInviteDetailDTO mapToDetailDto(GroupInvite invite) {
        GroupInviteDetailDTO dto = new GroupInviteDetailDTO();
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
        dto.setId(invite.getId());
        dto.setTripIntentId(invite.getTripIntentId());
        dto.setGroupId(invite.getGroupId());
        dto.setFromUserId(invite.getFromUserId());
        dto.setToUserId(invite.getToUserId());
        dto.setMessage(invite.getMessage());
        dto.setStatus(invite.getStatus());
        dto.setCreatedAt(invite.getCreatedAt());

        // Resolve Entities (Null safe)
        dto.setSender(userRepository.findById(invite.getFromUserId()).orElse(null));
        dto.setReceiver(userRepository.findById(invite.getToUserId()).orElse(null));
        dto.setTrip(tripIntentRepository.findById(invite.getTripIntentId()).orElse(null));

        return dto;
    }

    @Override
    public GroupInvite acceptInvite(String id) {
        GroupInvite invite = null;
        try {
            invite = getInviteById(id);
            System.out.println("Processing acceptance for invite ID: " + id);
            
            // 1. Resolve Group
            Group group = null;
            if (invite.getGroupId() != null) {
                group = groupRepository.findById(invite.getGroupId()).orElse(null);
            }
            
            // Fallback: search by tripId if groupId is null or not found
            if (group == null && invite.getTripIntentId() != null) {
                System.out.println("Group not found by ID, trying by Trip ID: " + invite.getTripIntentId());
                List<Group> groups = groupRepository.findByTripId(invite.getTripIntentId());
                if (!groups.isEmpty()) {
                    group = groups.get(0);
                    System.out.println("Found existing group: " + group.getId());
                    invite.setGroupId(group.getId());
                }
            }

            if (group == null) {
                throw new RuntimeException("Group not found for trip: " + invite.getTripIntentId());
            }

            // 2. Update Group membership
            if (group.getMemberUserIds() == null) {
                group.setMemberUserIds(new ArrayList<>());
            }

            boolean modified = false;
            String senderId = invite.getFromUserId();
            String targetId = invite.getToUserId();

            if (!group.getMemberUserIds().contains(targetId)) {
                group.getMemberUserIds().add(targetId);
                modified = true;
            }
            if (!group.getMemberUserIds().contains(senderId)) {
                group.getMemberUserIds().add(senderId);
                modified = true;
            }

            if (group.getMemberUserIds().size() >= 2) {
                group.setStatus(GroupStatus.ACTIVE);
                modified = true;
            }

            if (modified) {
                System.out.println("Saving updated group: " + group.getId() + " Members: " + group.getMemberUserIds());
                groupRepository.save(group);
            }

            // 3. Update and Save Invite
            invite.setStatus(GroupInviteStatus.ACCEPTED);
            System.out.println("Saving accepted invitation status.");
            return groupInviteRepository.save(invite);

        } catch (Exception e) {
            System.err.println("Critical error during invite acceptance: " + e.getMessage());
            e.printStackTrace();
            if (invite != null) {
                invite.setStatus(GroupInviteStatus.ACCEPTED);
                return groupInviteRepository.save(invite);
            }
            throw new RuntimeException("Failed to accept invite: " + e.getMessage());
        }
    }

    @Override
    public GroupInvite declineInvite(String id) {
        GroupInvite invite = getInviteById(id);
        invite.setStatus(GroupInviteStatus.DECLINED);
        return groupInviteRepository.save(invite);
    }

    @Override
    public GroupInvite cancelInvite(String id) {
        GroupInvite invite = getInviteById(id);
        invite.setStatus(GroupInviteStatus.CANCELLED);
        return groupInviteRepository.save(invite);
    }
}
