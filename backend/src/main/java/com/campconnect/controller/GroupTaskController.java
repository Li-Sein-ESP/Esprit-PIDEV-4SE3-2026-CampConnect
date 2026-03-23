package com.campconnect.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
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
    public ResponseEntity<GroupTask> createTask(@Valid @RequestBody GroupTaskDto dto) {
        GroupTask task = GroupTask.builder()
                .groupId(dto.getGroupId())
                .tripId(dto.getTripId())
                .title(dto.getTitle())
                .assignedToUserId(dto.getAssignedToUserId())
                .status(dto.getStatus())
                .dueDate(dto.getDueDate())
                .build();
        GroupTask created = groupTaskService.createTask(task);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<GroupTask> getTaskById(@PathVariable("id") String id) {
        return ResponseEntity.ok(groupTaskService.getTaskById(id));
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<GroupTask>> getTasksForGroup(@PathVariable("groupId") String groupId) {
        return ResponseEntity.ok(groupTaskService.getTasksForGroup(groupId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<GroupTask>> getTasksForUser(@PathVariable("userId") String userId) {
        return ResponseEntity.ok(groupTaskService.getTasksForUser(userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GroupTask> updateTask(@PathVariable("id") String id, @Valid @RequestBody GroupTaskDto dto) {
        GroupTask task = GroupTask.builder()
                .title(dto.getTitle())
                .assignedToUserId(dto.getAssignedToUserId())
                .status(dto.getStatus())
                .dueDate(dto.getDueDate())
                .build();
        return ResponseEntity.ok(groupTaskService.updateTask(id, task));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<GroupTask> completeTask(@PathVariable("id") String id) {
        return ResponseEntity.ok(groupTaskService.completeTask(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable("id") String id) {
        groupTaskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}
