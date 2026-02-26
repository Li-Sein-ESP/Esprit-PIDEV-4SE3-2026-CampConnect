package com.campconnect.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.campconnect.model.GroupTask;
import com.campconnect.model.GroupTaskStatus;
import com.campconnect.repository.GroupTaskRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GroupTaskServiceImpl implements IGroupTaskService {

    private final GroupTaskRepository groupTaskRepository;

    @Override
    public GroupTask createTask(GroupTask task) {
        task.setCreatedAt(LocalDateTime.now());
        if (task.getStatus() == null) {
            task.setStatus(GroupTaskStatus.TODO);
        }
        return groupTaskRepository.save(task);
    }

    @Override
    public GroupTask getTaskById(String id) {
        return groupTaskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("GroupTask not found with id: " + id));
    }

    @Override
    public List<GroupTask> getTasksForGroup(String groupId) {
        return groupTaskRepository.findByGroupId(groupId);
    }

    @Override
    public List<GroupTask> getTasksForUser(String userId) {
        return groupTaskRepository.findByAssignedToUserId(userId);
    }

    @Override
    public GroupTask updateTask(String id, GroupTask task) {
        GroupTask existing = getTaskById(id);
        existing.setTitle(task.getTitle());
        existing.setAssignedToUserId(task.getAssignedToUserId());
        existing.setStatus(task.getStatus());
        existing.setDueDate(task.getDueDate());
        return groupTaskRepository.save(existing);
    }

    @Override
    public GroupTask completeTask(String id) {
        GroupTask task = getTaskById(id);
        task.setStatus(GroupTaskStatus.DONE);
        return groupTaskRepository.save(task);
    }

    @Override
    public void deleteTask(String id) {
        groupTaskRepository.deleteById(id);
    }
}
