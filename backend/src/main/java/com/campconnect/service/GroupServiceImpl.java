package com.campconnect.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.campconnect.dto.GroupDetailDto;
import com.campconnect.model.Group;
import com.campconnect.model.GroupStatus;
import com.campconnect.model.User;
import com.campconnect.repository.GroupRepository;
import com.campconnect.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GroupServiceImpl implements IGroupService {

    private final GroupRepository groupRepository;
    private final UserRepository userRepository; // Injected UserRepository

    @Override
    public Group createGroup(Group group) {
        group.setCreatedAt(LocalDateTime.now());
        if (group.getStatus() == null) {
            group.setStatus(GroupStatus.DRAFT);
        }
        if (group.getMemberUserIds() == null) {
            group.setMemberUserIds(new ArrayList<>());
        }
        // Add creator to members if not already there
        if (group.getCreatorUserId() != null && !group.getMemberUserIds().contains(group.getCreatorUserId())) {
            group.getMemberUserIds().add(group.getCreatorUserId());
        }
        return groupRepository.save(group);
    }

    @Override
    public Group getGroupById(String id) {
        return groupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Group not found with id: " + id));
    }

    @Override
    public List<Group> getAllGroups() {
        return groupRepository.findAll();
    }

    @Override
    public GroupDetailDto getGroupDetail(String id) {
        Group group = getGroupById(id);
        List<User> members = (List<User>) userRepository.findAllById(group.getMemberUserIds());
        
        return GroupDetailDto.builder()
                .id(group.getId())
                .name(group.getName())
                .tripId(group.getTripId())
                .creatorUserId(group.getCreatorUserId())
                .status(group.getStatus())
                .members(members)
                .build();
    }

    @Override
    public java.util.Optional<Group> getGroupByTripId(String tripId) {
        List<Group> groups = groupRepository.findByTripId(tripId);
        return groups.stream().findFirst();
    }

    @Override
    public Group updateGroup(String id, Group group) {
        Group existing = getGroupById(id);
        existing.setName(group.getName());
        existing.setTripId(group.getTripId());
        existing.setMemberUserIds(group.getMemberUserIds());
        existing.setStatus(group.getStatus());
        return groupRepository.save(existing);
    }

    @Override
    public void deleteGroup(String id) {
        groupRepository.deleteById(id);
    }
}
