package com.campconnect.service;

import java.util.List;

import com.campconnect.model.GroupTask;

public interface IGroupTaskService {
    GroupTask createTask(GroupTask task);

    GroupTask getTaskById(String id);

    List<GroupTask> getTasksForGroup(String groupId);

    List<GroupTask> getTasksForUser(String userId);

    GroupTask updateTask(String id, GroupTask task);

    GroupTask completeTask(String id);

    void deleteTask(String id);
}
