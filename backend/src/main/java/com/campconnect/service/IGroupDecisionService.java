package com.campconnect.service;

import java.util.List;

import com.campconnect.model.GroupDecision;

public interface IGroupDecisionService {
    GroupDecision createDecision(GroupDecision decision);

    GroupDecision getDecisionById(String id);

    List<GroupDecision> getDecisionsForGroup(String groupId);

    GroupDecision vote(String decisionId, String userId, String option);

    GroupDecision closeDecision(String id);

    void deleteDecision(String id);
}
