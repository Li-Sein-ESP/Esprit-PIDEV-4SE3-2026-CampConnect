package com.campconnect.service.impl;

<<<<<<< HEAD
import com.campconnect.dto.GroupDetailDto;
=======
import com.campconnect.dto.GroupDetailDTO;
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
import com.campconnect.model.Group;
import com.campconnect.model.GroupStatus;
import com.campconnect.model.User;
import com.campconnect.repository.GroupRepository;
import com.campconnect.repository.UserRepository;
import com.campconnect.service.IGroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IGroupServiceImpl implements IGroupService {

    private final GroupRepository groupRepository;
    private final UserRepository userRepository;

    @Override
    public Group createGroup(Group group) {
        if (group.getStatus() == null) {
            group.setStatus(GroupStatus.DRAFT);
        }
        if (group.getMemberUserIds() != null && group.getCreatorUserId() != null
                && !group.getMemberUserIds().contains(group.getCreatorUserId())) {
            group.getMemberUserIds().add(group.getCreatorUserId());
        }
        // createdAt is handled by @CreatedDate, but set it manually as fallback
        if (group.getCreatedAt() == null) {
            group.setCreatedAt(LocalDateTime.now());
        }
        return groupRepository.save(group);
    }

    @Override
    public Group getGroupById(String id) {
        return groupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Group not found: " + id));
    }

    @Override
    public Optional<Group> getGroupByTripId(String tripId) {
        return groupRepository.findByTripId(tripId).stream().findFirst();
    }

    @Override
<<<<<<< HEAD
    public GroupDetailDto getGroupDetail(String id) {
        Group group = getGroupById(id);
        List<User> members = (List<User>) userRepository.findAllById(group.getMemberUserIds());
        return GroupDetailDto.builder()
=======
    public GroupDetailDTO getGroupDetail(String id) {
        Group group = getGroupById(id);
        List<User> members = (List<User>) userRepository.findAllById(group.getMemberUserIds());
        return GroupDetailDTO.builder()
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
                .id(group.getId())
                .name(group.getName())
                .tripId(group.getTripId())
                .creatorUserId(group.getCreatorUserId())
                .status(group.getStatus())
                .members(members)
                .build();
    }

    @Override
    public List<Group> getAllGroups() {
        return groupRepository.findAll();
    }

    @Override
    public Group updateGroup(String id, Group groupUpdate) {
        Group existing = getGroupById(id);
        if (groupUpdate.getName() != null) existing.setName(groupUpdate.getName());
        if (groupUpdate.getDescription() != null) existing.setDescription(groupUpdate.getDescription());
        if (groupUpdate.getTripId() != null) existing.setTripId(groupUpdate.getTripId());
        if (groupUpdate.getMemberUserIds() != null) existing.setMemberUserIds(groupUpdate.getMemberUserIds());
        if (groupUpdate.getStatus() != null) existing.setStatus(groupUpdate.getStatus());
        return groupRepository.save(existing);
    }

    @Override
    public Group leaveGroup(String groupId, String userId) {
        Group group = getGroupById(groupId);
        group.getMemberUserIds().remove(userId);
        return groupRepository.save(group);
    }

    @Override
    public void deleteGroup(String id) {
        groupRepository.deleteById(id);
    }
}
