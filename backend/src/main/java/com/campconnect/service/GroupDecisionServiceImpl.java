package com.campconnect.service;

import java.util.HashMap;
import java.util.List;

import org.springframework.stereotype.Service;

import com.campconnect.model.GroupDecision;
import com.campconnect.model.GroupDecisionStatus;
import com.campconnect.repository.GroupDecisionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GroupDecisionServiceImpl implements IGroupDecisionService {

    private final GroupDecisionRepository groupDecisionRepository;

    @Override
    public GroupDecision createDecision(GroupDecision decision) {
        if (decision.getStatus() == null) {
            decision.setStatus(GroupDecisionStatus.OPEN);
        }
        if (decision.getVotes() == null) {
            decision.setVotes(new HashMap<>());
        }
        return groupDecisionRepository.save(decision);
    }

    @Override
    public GroupDecision getDecisionById(String id) {
        return groupDecisionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("GroupDecision not found with id: " + id));
    }

    @Override
    public List<GroupDecision> getDecisionsForGroup(String groupId) {
        return groupDecisionRepository.findByGroupId(groupId);
    }

    @Override
    public GroupDecision vote(String decisionId, String userId, String option) {
        GroupDecision decision = getDecisionById(decisionId);

        if (decision.getStatus() == GroupDecisionStatus.CLOSED) {
            throw new IllegalStateException("Cannot vote on a closed decision");
        }

        if (!decision.getOptions().contains(option)) {
            throw new IllegalArgumentException("Invalid option selected");
        }

        decision.getVotes().put(userId, option);
        return groupDecisionRepository.save(decision);
    }

    @Override
    public GroupDecision closeDecision(String id) {
        GroupDecision decision = getDecisionById(id);
        decision.setStatus(GroupDecisionStatus.CLOSED);
        return groupDecisionRepository.save(decision);
    }

    @Override
    public void deleteDecision(String id) {
        groupDecisionRepository.deleteById(id);
    }
}
