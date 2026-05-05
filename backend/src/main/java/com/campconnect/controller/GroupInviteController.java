package com.campconnect.controller;

import java.util.List;

import com.campconnect.dto.GroupInviteDetailDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.campconnect.model.GroupInvite;
import com.campconnect.service.IGroupInviteService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@CrossOrigin(origins = "http://localhost:4200", maxAge = 3600)
@RestController
@RequestMapping("/api/group-invites")
@RequiredArgsConstructor
public class GroupInviteController {

    private final IGroupInviteService groupInviteService;

    @PostMapping
    public ResponseEntity<GroupInvite> createInvite(@Valid @RequestBody GroupInvite invite) {
        return ResponseEntity.ok(groupInviteService.createInvite(invite));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GroupInvite> getInviteById(@PathVariable("id") String id) {
        return ResponseEntity.ok(groupInviteService.getInviteById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<GroupInvite>> getInvitesForUser(@PathVariable("userId") String userId) {
        return ResponseEntity.ok(groupInviteService.getInvitesForUser(userId));
    }

    @GetMapping("/from-user/{userId}")
    public ResponseEntity<List<GroupInvite>> getInvitesFromUser(@PathVariable("userId") String userId) {
        return ResponseEntity.ok(groupInviteService.getInvitesByFromUser(userId));
    }

    @GetMapping("/user/{userId}/details")
    public ResponseEntity<List<GroupInviteDetailDto>> getInviteDetailsForUser(@PathVariable("userId") String userId) {
        return ResponseEntity.ok(groupInviteService.getInviteDetailsForUser(userId));
    }

    @GetMapping("/from-user/{userId}/details")
    public ResponseEntity<List<GroupInviteDetailDto>> getInviteDetailsFromUser(@PathVariable("userId") String userId) {
        return ResponseEntity.ok(groupInviteService.getInviteDetailsFromUser(userId));
    }

    @PatchMapping("/{id}/accept")
    public ResponseEntity<GroupInvite> acceptInvite(
            @PathVariable("id") String id,
            @org.springframework.web.bind.annotation.RequestParam(value = "reason", required = false) String reason,
            @org.springframework.web.bind.annotation.RequestParam(value = "helpful", required = false) Boolean helpful) {
        return ResponseEntity.ok(groupInviteService.acceptInvite(id, reason, helpful));
    }

    @PatchMapping("/{id}/decline")
    public ResponseEntity<GroupInvite> declineInvite(
            @PathVariable("id") String id,
            @org.springframework.web.bind.annotation.RequestParam(value = "reason", required = false) String reason,
            @org.springframework.web.bind.annotation.RequestParam(value = "helpful", required = false) Boolean helpful) {
        return ResponseEntity.ok(groupInviteService.declineInvite(id, reason, helpful));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelInvite(@PathVariable("id") String id) {
        groupInviteService.cancelInvite(id);
        return ResponseEntity.noContent().build();
    }
}
