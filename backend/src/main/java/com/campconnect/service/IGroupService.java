package com.campconnect.service;

import java.util.List;

import com.campconnect.model.Group;
<<<<<<< HEAD
import com.campconnect.dto.GroupDetailDto;
=======
import com.campconnect.dto.GroupDetailDTO;
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)

public interface IGroupService {
    Group createGroup(Group group);

    Group getGroupById(String id);

    java.util.Optional<Group> getGroupByTripId(String tripId);

<<<<<<< HEAD
    GroupDetailDto getGroupDetail(String id);
=======
    GroupDetailDTO getGroupDetail(String id);
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
    List<Group> getAllGroups();

    Group updateGroup(String id, Group group);
    Group leaveGroup(String groupId, String userId);

    void deleteGroup(String id);
}
