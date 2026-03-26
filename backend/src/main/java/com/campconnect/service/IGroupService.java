package com.campconnect.service;

import java.util.List;

import com.campconnect.model.Group;
import com.campconnect.dto.GroupDetailDto;

public interface IGroupService {
    Group createGroup(Group group);

    Group getGroupById(String id);

    java.util.Optional<Group> getGroupByTripId(String tripId);

    GroupDetailDto getGroupDetail(String id);
    List<Group> getAllGroups();

    Group updateGroup(String id, Group group);

    void deleteGroup(String id);
}
