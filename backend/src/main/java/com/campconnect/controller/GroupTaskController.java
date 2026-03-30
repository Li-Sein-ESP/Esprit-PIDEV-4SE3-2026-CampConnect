package com.campconnect.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campconnect.dto.GroupTaskDto;
import com.campconnect.model.GroupTask;
import com.campconnect.service.IGroupTaskService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/group-tasks")
@RequiredArgsConstructor
public class GroupTaskController {

    private final IGroupTaskService groupTaskService;

    @PostMapping
    public ResponseEntity<GroupTask> createGroupTask(@Valid @RequestBody GroupTaskDto dto) {
        GroupTask task = mapDtoToEntity(dto);
        GroupTask created = groupTaskService.createGroupTask(task);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<GroupTask>> getTasksByGroupId(@PathVariable("groupId") String groupId) {
        return ResponseEntity.ok(groupTaskService.getTasksByGroupId(groupId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GroupTask> updateGroupTask(@PathVariable("id") String id, @RequestBody GroupTaskDto dto) {
        GroupTask task = mapDtoToEntity(dto);
        return ResponseEntity.ok(groupTaskService.updateGroupTask(id, task));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGroupTask(@PathVariable("id") String id) {
        groupTaskService.deleteGroupTask(id);
        return ResponseEntity.noContent().build();
    }

    private GroupTask mapDtoToEntity(GroupTaskDto dto) {
        return GroupTask.builder()
                .groupId(dto.getGroupId())
                .title(dto.getTitle())
                .assignedUserId(dto.getAssignedUserId())
                .isCompleted(dto.getIsCompleted())
                .build();
    }
}
