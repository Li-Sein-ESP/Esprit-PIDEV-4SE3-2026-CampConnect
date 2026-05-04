package com.campconnect.service;

import com.campconnect.model.GroupTask;
import com.campconnect.repository.GroupTaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GroupTaskServiceImplTest {

    @Mock
    private GroupTaskRepository groupTaskRepository;

    @InjectMocks
    private GroupTaskServiceImpl groupTaskService;

    private GroupTask sampleTask;

    @BeforeEach
    void setUp() {
        sampleTask = new GroupTask();
        sampleTask.setId("task-1");
        sampleTask.setGroupId("group-1");
        sampleTask.setTitle("Pack the tent");
        sampleTask.setIsCompleted(false);
    }

    @Test
    void createGroupTask_ShouldInitializeCorrectly() {
        // Arrange
        when(groupTaskRepository.save(any(GroupTask.class))).thenAnswer(i -> i.getArgument(0));

        // Act
        GroupTask result = groupTaskService.createGroupTask(sampleTask);

        // Assert
        assertNotNull(result.getCreatedAt());
        assertFalse(result.getIsCompleted());
        verify(groupTaskRepository).save(sampleTask);
    }

    @Test
    void getGroupTaskById_ShouldReturn_WhenExists() {
        // Arrange
        when(groupTaskRepository.findById("task-1")).thenReturn(Optional.of(sampleTask));

        // Act
        GroupTask result = groupTaskService.getGroupTaskById("task-1");

        // Assert
        assertEquals("task-1", result.getId());
    }

    @Test
    void updateGroupTask_ShouldUpdateTitleAndAssignment() {
        // Arrange
        GroupTask updateInfo = new GroupTask();
        updateInfo.setTitle("Clean the tent");
        updateInfo.setAssignedUserId("user-assigned");

        when(groupTaskRepository.findById("task-1")).thenReturn(Optional.of(sampleTask));
        when(groupTaskRepository.save(any(GroupTask.class))).thenReturn(sampleTask);

        // Act
        GroupTask result = groupTaskService.updateGroupTask("task-1", updateInfo);

        // Assert
        assertEquals("Clean the tent", result.getTitle());
        assertEquals("user-assigned", result.getAssignedUserId());
        verify(groupTaskRepository).save(sampleTask);
    }

    @Test
    void updateGroupTask_ShouldUpdateCompletionStatus() {
        // Arrange
        GroupTask updateInfo = new GroupTask();
        updateInfo.setIsCompleted(true);

        when(groupTaskRepository.findById("task-1")).thenReturn(Optional.of(sampleTask));
        when(groupTaskRepository.save(any(GroupTask.class))).thenReturn(sampleTask);

        // Act
        GroupTask result = groupTaskService.updateGroupTask("task-1", updateInfo);

        // Assert
        assertTrue(result.getIsCompleted());
        verify(groupTaskRepository).save(sampleTask);
    }
}
