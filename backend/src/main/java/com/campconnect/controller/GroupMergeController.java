package com.campconnect.controller;

import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.campconnect.model.GroupMergeProposal;
import com.campconnect.repository.GroupMergeProposalRepository;

import com.campconnect.model.Group;
import com.campconnect.model.GroupStatus;
import com.campconnect.service.IGroupService;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/mergers")
@RequiredArgsConstructor
public class GroupMergeController {

    private final GroupMergeProposalRepository proposalRepository;
    private final IGroupService groupService;

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<GroupMergeProposal>> getProposalsForGroup(@PathVariable String groupId) {
        List<GroupMergeProposal> proposals = proposalRepository.findBySourceGroupIdAndStatus(groupId, "PENDING");
        proposals.addAll(proposalRepository.findByTargetGroupIdAndStatus(groupId, "PENDING"));
        return ResponseEntity.ok(proposals);
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<GroupMergeProposal> acceptProposal(@PathVariable String id, @RequestParam String groupId) {
        GroupMergeProposal proposal = proposalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Proposal not found"));

        if (groupId.equals(proposal.getSourceGroupId())) {
            proposal.setSourceAccepted(true);
        } else if (groupId.equals(proposal.getTargetGroupId())) {
            proposal.setTargetAccepted(true);
        } else {
            throw new RuntimeException("Group ID does not belong to this proposal");
        }

        // If both accepted, trigger real merge
        if (proposal.isSourceAccepted() && proposal.isTargetAccepted()) {
            proposal.setStatus("MERGED");
            
            // Execute real merge
            Group sourceGroup = groupService.getGroupById(proposal.getSourceGroupId());
            Group targetGroup = groupService.getGroupById(proposal.getTargetGroupId());
            
            // Move members
            if (sourceGroup.getMemberUserIds() != null) {
                if (targetGroup.getMemberUserIds() == null) {
                    targetGroup.setMemberUserIds(new ArrayList<>());
                }
                for (String userId : sourceGroup.getMemberUserIds()) {
                    if (!targetGroup.getMemberUserIds().contains(userId)) {
                        targetGroup.getMemberUserIds().add(userId);
                    }
                }
            }
            groupService.updateGroup(targetGroup.getId(), targetGroup);
            
            // Inactivate source group
            sourceGroup.setStatus(GroupStatus.INACTIVE);
            groupService.updateGroup(sourceGroup.getId(), sourceGroup);
        }

        return ResponseEntity.ok(proposalRepository.save(proposal));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<GroupMergeProposal> rejectProposal(@PathVariable String id) {
        GroupMergeProposal proposal = proposalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Proposal not found"));
        proposal.setStatus("REJECTED");
        return ResponseEntity.ok(proposalRepository.save(proposal));
    }
}
