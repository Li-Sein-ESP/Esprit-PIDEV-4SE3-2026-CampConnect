package com.campconnect.service;

import com.campconnect.dto.GroupDto;
import java.util.List;

public interface GroupService {
    GroupDto createGroup(GroupDto groupDTO);
    GroupDto getGroupById(String id);
    List<GroupDto> getAllGroups();
    void deleteGroup(String id);
}
