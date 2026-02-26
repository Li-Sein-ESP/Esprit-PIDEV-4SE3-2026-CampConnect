package com.campconnect.service;

import java.util.List;

import com.campconnect.model.Group;

public interface IGroupService {
    Group createGroup(Group group);

    Group getGroupById(String id);

    List<Group> getAllGroups();

    Group updateGroup(String id, Group group);

    void deleteGroup(String id);
}
