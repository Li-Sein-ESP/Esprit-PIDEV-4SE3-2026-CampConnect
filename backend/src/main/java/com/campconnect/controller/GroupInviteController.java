package com.campconnect.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

<<<<<<< HEAD
import com.campconnect.dto.GroupInviteDetailDto;
=======
import com.campconnect.dto.GroupInviteDetailDTO;
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
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
<<<<<<< HEAD
    public ResponseEntity<List<GroupInviteDetailDto>> getInviteDetailsForUser(@PathVariable("userId") String userId) {
        return ResponseEntity.ok(groupInviteService.getInviteDetailsForUser(userId));
    }

    @GetMapping("/from-user/{userId}/details")
    public ResponseEntity<List<GroupInviteDetailDto>> getInviteDetailsFromUser(@PathVariable("userId") String userId) {
=======
    public ResponseEntity<List<GroupInviteDetailDTO>> getInviteDetailsForUser(@PathVariable("userId") String userId) {
        return ResponseEntity.ok(groupInviteService.getInviteDetailsForUser(userId));
    }

    @GetMapping("/from/{userId}/detail")
    public ResponseEntity<List<GroupInviteDetailDTO>> getInviteDetailsFromUser(@PathVariable("userId") String userId) {
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
        return ResponseEntity.ok(groupInviteService.getInviteDetailsFromUser(userId));
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
