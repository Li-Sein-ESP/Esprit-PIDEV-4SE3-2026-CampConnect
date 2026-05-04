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

<<<<<<< HEAD
import com.campconnect.dto.GroupTaskDto;
=======
import com.campconnect.dto.GroupTaskDTO;
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
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
<<<<<<< HEAD
    public ResponseEntity<GroupTask> createGroupTask(@Valid @RequestBody GroupTaskDto dto) {
=======
    public ResponseEntity<GroupTask> createGroupTask(@Valid @RequestBody GroupTaskDTO dto) {
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
        GroupTask task = mapDtoToEntity(dto);
        GroupTask created = groupTaskService.createGroupTask(task);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<GroupTask>> getTasksByGroupId(@PathVariable("groupId") String groupId) {
        return ResponseEntity.ok(groupTaskService.getTasksByGroupId(groupId));
    }

    @PutMapping("/{id}")
<<<<<<< HEAD
    public ResponseEntity<GroupTask> updateGroupTask(@PathVariable("id") String id, @RequestBody GroupTaskDto dto) {
=======
    public ResponseEntity<GroupTask> updateGroupTask(@PathVariable("id") String id, @RequestBody GroupTaskDTO dto) {
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
        GroupTask task = mapDtoToEntity(dto);
        return ResponseEntity.ok(groupTaskService.updateGroupTask(id, task));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGroupTask(@PathVariable("id") String id) {
        groupTaskService.deleteGroupTask(id);
        return ResponseEntity.noContent().build();
    }

<<<<<<< HEAD
    private GroupTask mapDtoToEntity(GroupTaskDto dto) {
=======
    private GroupTask mapDtoToEntity(GroupTaskDTO dto) {
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
        return GroupTask.builder()
                .groupId(dto.getGroupId())
                .title(dto.getTitle())
                .assignedUserId(dto.getAssignedUserId())
                .isCompleted(dto.getIsCompleted())
                .build();
    }
}
