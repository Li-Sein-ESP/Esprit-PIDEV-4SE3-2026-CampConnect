package com.campconnect.service;

import com.campconnect.dto.GroupDTO;
import java.util.List;

public interface GroupService {
<<<<<<< HEAD
    GroupDTO createGroup(GroupDTO groupDTO);
=======
    GroupDTO createGroup(GroupDTO GroupDTO);
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
    GroupDTO getGroupById(String id);
    List<GroupDTO> getAllGroups();
    void deleteGroup(String id);
}
