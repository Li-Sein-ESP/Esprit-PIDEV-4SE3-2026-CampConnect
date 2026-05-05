package com.campconnect.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.campconnect.model.GroupTask;
import com.campconnect.repository.GroupTaskRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GroupTaskServiceImpl implements IGroupTaskService {

    private final GroupTaskRepository groupTaskRepository;
    private final NotificationService notificationService;
    private final com.campconnect.repository.GroupRepository groupRepository;

    @Override
    public GroupTask createGroupTask(GroupTask groupTask) {
        groupTask.setCreatedAt(LocalDateTime.now());
        if (groupTask.getIsCompleted() == null) {
            groupTask.setIsCompleted(false);
        }
        GroupTask savedTask = groupTaskRepository.save(groupTask);
        
        // Notify members (excluding the creator)
        notifyGroupMembers(savedTask.getGroupId(), "Nouvelle tâche : " + savedTask.getTitle(), 
                          com.campconnect.model.NotificationType.TASK_UPDATE, savedTask.getLastModifiedBy());
        
        return savedTask;
    }

    private void notifyGroupMembers(String groupId, String message, com.campconnect.model.NotificationType type, String actorUserId) {
        groupRepository.findById(groupId).ifPresent(group -> {
            if (group.getMemberUserIds() != null) {
                for (String userId : group.getMemberUserIds()) {
                    // Skip the person who performed the action
                    if (userId.equals(actorUserId)) continue;
                    
                    notificationService.createNotification(userId, "Organisation du Groupe \ud83d\udccb", 
                                                         message, type, groupId);
                }
            }
        });
    }

    @Override
    public List<GroupTask> getTasksByGroupId(String groupId) {
        return groupTaskRepository.findByGroupId(groupId);
    }

    @Override
    public GroupTask getGroupTaskById(String id) {
        return groupTaskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("GroupTask not found with id: " + id));
    }

    @Override
    public GroupTask updateGroupTask(String id, GroupTask groupTask) {
        GroupTask existing = getGroupTaskById(id);
        
        if (groupTask.getTitle() != null) {
            existing.setTitle(groupTask.getTitle());
        }
        if (groupTask.getAssignedUserId() != null) {
            existing.setAssignedUserId(groupTask.getAssignedUserId());
        }
        if (groupTask.getIsCompleted() != null && !groupTask.getIsCompleted().equals(existing.getIsCompleted())) {
            existing.setIsCompleted(groupTask.getIsCompleted());
            String status = existing.getIsCompleted() ? "terminée \u2705" : "réouverte \u26a0\ufe0f";
            notifyGroupMembers(existing.getGroupId(), "Tâche " + status + " : " + existing.getTitle(), 
                              com.campconnect.model.NotificationType.TASK_UPDATE, groupTask.getLastModifiedBy());
        }
        
        return groupTaskRepository.save(existing);
    }

    @Override
    public void deleteGroupTask(String id) {
        groupTaskRepository.deleteById(id);
    }
}
