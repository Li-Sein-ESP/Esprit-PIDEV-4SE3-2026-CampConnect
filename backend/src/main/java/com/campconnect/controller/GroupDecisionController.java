package com.campconnect.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campconnect.dto.GroupDecisionDto;
import com.campconnect.dto.VoteRequest;
import com.campconnect.model.GroupDecision;
import com.campconnect.service.IGroupDecisionService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/group-decisions")
@RequiredArgsConstructor
public class GroupDecisionController {

    private final IGroupDecisionService groupDecisionService;

    @PostMapping
    public ResponseEntity<GroupDecision> createDecision(@Valid @RequestBody GroupDecisionDto dto) {
        GroupDecision decision = GroupDecision.builder()
                .groupId(dto.getGroupId())
                .tripId(dto.getTripId())
                .type(dto.getType())
                .question(dto.getQuestion())
                .options(dto.getOptions())
                .deadline(dto.getDeadline())
                .build();
        GroupDecision created = groupDecisionService.createDecision(decision);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<GroupDecision> getDecisionById(@PathVariable String id) {
        return ResponseEntity.ok(groupDecisionService.getDecisionById(id));
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<GroupDecision>> getDecisionsForGroup(@PathVariable String groupId) {
        return ResponseEntity.ok(groupDecisionService.getDecisionsForGroup(groupId));
    }

    @PatchMapping("/{id}/vote")
    public ResponseEntity<GroupDecision> vote(@PathVariable String id, @RequestBody VoteRequest voteRequest) {
        return ResponseEntity.ok(groupDecisionService.vote(id, voteRequest.getUserId(), voteRequest.getOption()));
    }

    @PatchMapping("/{id}/close")
    public ResponseEntity<GroupDecision> closeDecision(@PathVariable String id) {
        return ResponseEntity.ok(groupDecisionService.closeDecision(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDecision(@PathVariable String id) {
        groupDecisionService.deleteDecision(id);
        return ResponseEntity.noContent().build();
    }
}
