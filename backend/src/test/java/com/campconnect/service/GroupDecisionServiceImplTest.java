package com.campconnect.service;

import com.campconnect.model.GroupDecision;
import com.campconnect.model.GroupDecisionStatus;
import com.campconnect.repository.GroupDecisionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GroupDecisionServiceImplTest {

    @Mock
    private GroupDecisionRepository groupDecisionRepository;

    @InjectMocks
    private GroupDecisionServiceImpl groupDecisionService;

    private GroupDecision sampleDecision;

    @BeforeEach
    void setUp() {
        sampleDecision = new GroupDecision();
        sampleDecision.setId("dec-1");
        sampleDecision.setGroupId("group-1");
        sampleDecision.setQuestion("Ou camper ?");
        sampleDecision.setOptions(Arrays.asList("Montagne", "Plage", "Forêt"));
        sampleDecision.setVotes(new HashMap<>());
        sampleDecision.setStatus(GroupDecisionStatus.OPEN);
    }

    @Test
    void createDecision_ShouldInitializeCorrectly() {
        // Arrange
        when(groupDecisionRepository.save(any(GroupDecision.class))).thenAnswer(i -> i.getArgument(0));

        // Act
        GroupDecision result = groupDecisionService.createDecision(sampleDecision);

        // Assert
        assertEquals(GroupDecisionStatus.OPEN, result.getStatus());
        assertNotNull(result.getVotes());
        verify(groupDecisionRepository).save(sampleDecision);
    }

    @Test
    void vote_ShouldRecordVote_WhenValid() {
        // Arrange
        when(groupDecisionRepository.findById("dec-1")).thenReturn(Optional.of(sampleDecision));
        when(groupDecisionRepository.save(any(GroupDecision.class))).thenReturn(sampleDecision);

        // Act
        GroupDecision result = groupDecisionService.vote("dec-1", "user-1", "Montagne");

        // Assert
        assertEquals("Montagne", result.getVotes().get("user-1"));
        verify(groupDecisionRepository).save(sampleDecision);
    }

    @Test
    void vote_ShouldThrow_WhenClosed() {
        // Arrange
        sampleDecision.setStatus(GroupDecisionStatus.CLOSED);
        when(groupDecisionRepository.findById("dec-1")).thenReturn(Optional.of(sampleDecision));

        // Act & Assert
        assertThrows(IllegalStateException.class, () -> 
            groupDecisionService.vote("dec-1", "user-1", "Montagne")
        );
    }

    @Test
    void vote_ShouldThrow_WhenOptionInvalid() {
        // Arrange
        when(groupDecisionRepository.findById("dec-1")).thenReturn(Optional.of(sampleDecision));

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> 
            groupDecisionService.vote("dec-1", "user-1", "Espace")
        );
    }

    @Test
    void closeDecision_ShouldUpdateStatus() {
        // Arrange
        when(groupDecisionRepository.findById("dec-1")).thenReturn(Optional.of(sampleDecision));
        when(groupDecisionRepository.save(any(GroupDecision.class))).thenReturn(sampleDecision);

        // Act
        GroupDecision result = groupDecisionService.closeDecision("dec-1");

        // Assert
        assertEquals(GroupDecisionStatus.CLOSED, result.getStatus());
    }
}
