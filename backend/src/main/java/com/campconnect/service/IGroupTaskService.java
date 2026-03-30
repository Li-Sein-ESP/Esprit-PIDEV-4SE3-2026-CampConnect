package com.campconnect.service;

import java.util.List;

import com.campconnect.model.GroupTask;

public interface IGroupTaskService {
    GroupTask createGroupTask(GroupTask groupTask);
    List<GroupTask> getTasksByGroupId(String groupId);
    GroupTask getGroupTaskById(String id);
    GroupTask updateGroupTask(String id, GroupTask groupTask);
    void deleteGroupTask(String id);
}
