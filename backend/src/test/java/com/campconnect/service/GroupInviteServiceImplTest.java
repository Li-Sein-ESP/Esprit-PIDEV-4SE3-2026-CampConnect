package com.campconnect.service;

import com.campconnect.model.*;
import com.campconnect.repository.GroupInviteRepository;
import com.campconnect.repository.GroupRepository;
import com.campconnect.repository.TripIntentRepository;
import com.campconnect.repository.UserRepository;
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
class GroupInviteServiceImplTest {

    @Mock
    private GroupInviteRepository groupInviteRepository;
    @Mock
    private GroupRepository groupRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private TripIntentRepository tripIntentRepository;

    @InjectMocks
    private GroupInviteServiceImpl groupInviteService;

    private GroupInvite sampleInvite;
    private Group sampleGroup;

    @BeforeEach
    void setUp() {
        sampleInvite = new GroupInvite();
        sampleInvite.setId("invite-1");
        sampleInvite.setFromUserId("user-sender");
        sampleInvite.setToUserId("user-receiver");
        sampleInvite.setGroupId("group-1");
        sampleInvite.setTripIntentId("trip-1");
        sampleInvite.setStatus(GroupInviteStatus.PENDING);

        sampleGroup = new Group();
        sampleGroup.setId("group-1");
        sampleGroup.setTripId("trip-1");
        sampleGroup.setMemberUserIds(new ArrayList<>(Arrays.asList("user-sender")));
        sampleGroup.setStatus(GroupStatus.DRAFT);
    }

    @Test
    void createInvite_ShouldInitializeCorrectly() {
        // Arrange
        when(groupInviteRepository.save(any(GroupInvite.class))).thenAnswer(i -> i.getArgument(0));

        // Act
        GroupInvite result = groupInviteService.createInvite(sampleInvite);

        // Assert
        assertNotNull(result.getCreatedAt());
        assertEquals(GroupInviteStatus.PENDING, result.getStatus());
        verify(groupInviteRepository).save(sampleInvite);
    }

    @Test
    void acceptInvite_ShouldAddUserAndActivateGroup() {
        // Arrange
        when(groupInviteRepository.findById("invite-1")).thenReturn(Optional.of(sampleInvite));
        when(groupRepository.findById("group-1")).thenReturn(Optional.of(sampleGroup));
        when(groupRepository.save(any(Group.class))).thenReturn(sampleGroup);
        when(groupInviteRepository.save(any(GroupInvite.class))).thenReturn(sampleInvite);

        // Act
        GroupInvite result = groupInviteService.acceptInvite("invite-1");

        // Assert
        assertEquals(GroupInviteStatus.ACCEPTED, result.getStatus());
        assertTrue(sampleGroup.getMemberUserIds().contains("user-receiver"));
        assertEquals(GroupStatus.ACTIVE, sampleGroup.getStatus());
        verify(groupRepository).save(sampleGroup);
    }

    @Test
    void acceptInvite_ShouldFallbackToTripIdIfGroupIdMissing() {
        // Arrange
        sampleInvite.setGroupId(null);
        when(groupInviteRepository.findById("invite-1")).thenReturn(Optional.of(sampleInvite));
        when(groupRepository.findByTripId("trip-1")).thenReturn(Arrays.asList(sampleGroup));
        when(groupRepository.save(any(Group.class))).thenReturn(sampleGroup);
        when(groupInviteRepository.save(any(GroupInvite.class))).thenReturn(sampleInvite);

        // Act
        GroupInvite result = groupInviteService.acceptInvite("invite-1");

        // Assert
        assertEquals("group-1", sampleInvite.getGroupId());
        assertEquals(GroupInviteStatus.ACCEPTED, result.getStatus());
        verify(groupRepository).save(sampleGroup);
    }

    @Test
    void declineInvite_ShouldUpdateStatus() {
        // Arrange
        when(groupInviteRepository.findById("invite-1")).thenReturn(Optional.of(sampleInvite));
        when(groupInviteRepository.save(any(GroupInvite.class))).thenReturn(sampleInvite);

        // Act
        GroupInvite result = groupInviteService.declineInvite("invite-1");

        // Assert
        assertEquals(GroupInviteStatus.DECLINED, result.getStatus());
    }
}
