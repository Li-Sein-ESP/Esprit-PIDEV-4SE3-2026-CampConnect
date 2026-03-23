package com.campconnect.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campconnect.dto.GroupInviteDto;
import com.campconnect.model.GroupInvite;
import com.campconnect.service.IGroupInviteService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/group-invites")
@RequiredArgsConstructor
public class GroupInviteController {

    private final IGroupInviteService groupInviteService;

    @PostMapping
    public ResponseEntity<GroupInvite> sendInvite(@Valid @RequestBody GroupInviteDto dto) {
        GroupInvite invite = GroupInvite.builder()
                .tripIntentId(dto.getTripIntentId())
                .groupId(dto.getGroupId())
                .fromUserId(dto.getFromUserId())
                .toUserId(dto.getToUserId())
                .message(dto.getMessage())
                .expiresAt(dto.getExpiresAt())
                .build();
        GroupInvite created = groupInviteService.sendInvite(invite);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<GroupInvite> getInviteById(@PathVariable("id") String id) {
        return ResponseEntity.ok(groupInviteService.getInviteById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<GroupInvite>> getInvitesForUser(@PathVariable("userId") String userId) {
        return ResponseEntity.ok(groupInviteService.getInvitesForUser(userId));
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<GroupInvite>> getInvitesForGroup(@PathVariable("groupId") String groupId) {
        return ResponseEntity.ok(groupInviteService.getInvitesForGroup(groupId));
    }

    @PatchMapping("/{id}/accept")
    public ResponseEntity<GroupInvite> acceptInvite(@PathVariable("id") String id) {
        return ResponseEntity.ok(groupInviteService.acceptInvite(id));
    }

    @PatchMapping("/{id}/decline")
    public ResponseEntity<GroupInvite> declineInvite(@PathVariable("id") String id) {
        return ResponseEntity.ok(groupInviteService.declineInvite(id));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelInvite(@PathVariable("id") String id) {
        groupInviteService.cancelInvite(id);
        return ResponseEntity.noContent().build();
    }
}
