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

    @Override
    public GroupTask createGroupTask(GroupTask groupTask) {
        groupTask.setCreatedAt(LocalDateTime.now());
        if (groupTask.getIsCompleted() == null) {
            groupTask.setIsCompleted(false);
        }
        return groupTaskRepository.save(groupTask);
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
        if (groupTask.getIsCompleted() != null) {
            existing.setIsCompleted(groupTask.getIsCompleted());
        }
        
        return groupTaskRepository.save(existing);
    }

    @Override
    public void deleteGroupTask(String id) {
        groupTaskRepository.deleteById(id);
    }
}
