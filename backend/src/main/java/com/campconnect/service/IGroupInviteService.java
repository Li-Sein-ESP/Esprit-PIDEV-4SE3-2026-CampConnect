package com.campconnect.service;

import java.util.List;

<<<<<<< HEAD
import com.campconnect.dto.GroupInviteDetailDto;
=======
import com.campconnect.dto.GroupInviteDetailDTO;
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
import com.campconnect.model.GroupInvite;

public interface IGroupInviteService {
    GroupInvite createInvite(GroupInvite invite);
    GroupInvite acceptInvite(String id);
    GroupInvite declineInvite(String id);
    GroupInvite cancelInvite(String id);
    List<GroupInvite> getInvitesForUser(String userId);
    List<GroupInvite> getInvitesByFromUser(String userId);
    GroupInvite getInviteById(String id);
    
    // Aggregation methods
<<<<<<< HEAD
    List<GroupInviteDetailDto> getInviteDetailsForUser(String userId);
    List<GroupInviteDetailDto> getInviteDetailsFromUser(String userId);
=======
    List<GroupInviteDetailDTO> getInviteDetailsForUser(String userId);
    List<GroupInviteDetailDTO> getInviteDetailsFromUser(String userId);
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
}
