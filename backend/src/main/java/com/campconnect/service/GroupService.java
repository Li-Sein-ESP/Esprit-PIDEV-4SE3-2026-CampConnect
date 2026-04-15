package com.campconnect.service;

import com.campconnect.dto.GroupDTO;
import java.util.List;

public interface GroupService {
    GroupDTO createGroup(GroupDTO GroupDTO);
    GroupDTO getGroupById(String id);
    List<GroupDTO> getAllGroups();
    void deleteGroup(String id);
}
