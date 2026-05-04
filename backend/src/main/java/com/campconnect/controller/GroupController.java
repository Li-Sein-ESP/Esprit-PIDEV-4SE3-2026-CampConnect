package com.campconnect.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campconnect.dto.GroupDTO;
import com.campconnect.model.GroupStatus;
import com.campconnect.model.Group;
import com.campconnect.service.IGroupService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@CrossOrigin(origins = "http://localhost:4200", maxAge = 3600)
@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final IGroupService groupService;

    @PostMapping
    public ResponseEntity<Group> createGroup(@Valid @RequestBody GroupDTO dto) {
        Group group = Group.builder()
                .name(dto.getName())
                .creatorUserId(dto.getCreatorUserId())
                .tripId(dto.getTripId())
                .memberUserIds(dto.getMemberUserIds())
                .status(dto.getStatus() != null ? GroupStatus.valueOf(dto.getStatus().toUpperCase()) : GroupStatus.ACTIVE)
                .build();
        Group created = groupService.createGroup(group);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Group> getGroupById(@PathVariable("id") String id) {
        return ResponseEntity.ok(groupService.getGroupById(id));
    }

    @GetMapping("/{id}/detail")
<<<<<<< HEAD
    public ResponseEntity<com.campconnect.dto.GroupDetailDto> getGroupDetail(@PathVariable("id") String id) {
=======
    public ResponseEntity<com.campconnect.dto.GroupDetailDTO> getGroupDetail(@PathVariable("id") String id) {
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
        return ResponseEntity.ok(groupService.getGroupDetail(id));
    }

    @GetMapping
    public ResponseEntity<List<Group>> getAllGroups() {
        return ResponseEntity.ok(groupService.getAllGroups());
    }

    @GetMapping("/trip/{tripId}")
    public ResponseEntity<Group> getGroupByTripId(@PathVariable("tripId") String tripId) {
        return groupService.getGroupByTripId(tripId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Group> updateGroup(@PathVariable("id") String id, @Valid @RequestBody GroupDTO dto) {
        Group group = Group.builder()
                .name(dto.getName())
                .tripId(dto.getTripId())
                .memberUserIds(dto.getMemberUserIds())
                .status(dto.getStatus() != null ? GroupStatus.valueOf(dto.getStatus().toUpperCase()) : GroupStatus.ACTIVE)
                .build();
        return ResponseEntity.ok(groupService.updateGroup(id, group));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGroup(@PathVariable("id") String id) {
        groupService.deleteGroup(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/leave/{userId}")
    public ResponseEntity<Group> leaveGroup(@PathVariable("id") String id, @PathVariable("userId") String userId) {
        return ResponseEntity.ok(groupService.leaveGroup(id, userId));
    }
}
