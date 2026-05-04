package com.campconnect.service;

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
import com.campconnect.service.impl.IGroupServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GroupServiceImplTest {

    @Mock
    private GroupRepository groupRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private IGroupServiceImpl groupService;

    private Group sampleGroup;

    @BeforeEach
    void setUp() {
        sampleGroup = new Group();
        sampleGroup.setId("group-1");
        sampleGroup.setName("Test Group");
        sampleGroup.setCreatorUserId("user-1");
        sampleGroup.setMemberUserIds(new ArrayList<>(Arrays.asList("user-1")));
        sampleGroup.setStatus(GroupStatus.ACTIVE);
    }

    @Test
    void createGroup_ShouldInitializeCorrectly() {
        // Arrange
        when(groupRepository.save(any(Group.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Group newGroup = new Group();
        newGroup.setName("New Group");
        newGroup.setCreatorUserId("user-creator");

        // Act
        Group result = groupService.createGroup(newGroup);

        // Assert
        assertNotNull(result.getCreatedAt());
        assertEquals(GroupStatus.DRAFT, result.getStatus());
        assertTrue(result.getMemberUserIds().contains("user-creator"));
        verify(groupRepository, times(1)).save(newGroup);
    }

    @Test
    void getGroupById_ShouldReturn_WhenExists() {
        // Arrange
        when(groupRepository.findById("group-1")).thenReturn(Optional.of(sampleGroup));

        // Act
        Group result = groupService.getGroupById("group-1");

        // Assert
        assertEquals("group-1", result.getId());
    }

    @Test
    void getGroupById_ShouldThrow_WhenNotFound() {
        // Arrange
        when(groupRepository.findById("unknown")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> groupService.getGroupById("unknown"));
    }

    @Test
<<<<<<< HEAD
    void getGroupDetail_ShouldReturnConstructedDto() {
=======
    void getGroupDetail_ShouldReturnConstructedDTO() {
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
        // Arrange
        User user1 = new User();
        user1.setId("user-1");
        user1.setUsername("member1");

        when(groupRepository.findById("group-1")).thenReturn(Optional.of(sampleGroup));
        when(userRepository.findAllById(any())).thenReturn(Arrays.asList(user1));

        // Act
<<<<<<< HEAD
        GroupDetailDto detail = groupService.getGroupDetail("group-1");
=======
        GroupDetailDTO detail = groupService.getGroupDetail("group-1");
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)

        // Assert
        assertEquals("group-1", detail.getId());
        assertEquals(1, detail.getMembers().size());
        assertEquals("member1", detail.getMembers().get(0).getUsername());
    }

    @Test
    void updateGroup_ShouldUpdateFields() {
        // Arrange
        Group updateInfo = new Group();
        updateInfo.setName("Updated name");
        updateInfo.setStatus(GroupStatus.INACTIVE);

        when(groupRepository.findById("group-1")).thenReturn(Optional.of(sampleGroup));
        when(groupRepository.save(any(Group.class))).thenReturn(sampleGroup);

        // Act
        Group result = groupService.updateGroup("group-1", updateInfo);

        // Assert
        assertEquals("Updated name", result.getName());
        assertEquals(GroupStatus.INACTIVE, result.getStatus());
        verify(groupRepository, times(1)).save(sampleGroup);
    }
}
