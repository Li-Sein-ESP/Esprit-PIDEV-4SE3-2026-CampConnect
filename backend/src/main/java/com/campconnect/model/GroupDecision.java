package com.campconnect.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "group_decisions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupDecision {
    @Id
    private String id;

    private String groupId;

    private String tripId;

    private GroupDecisionType type;

    private String question;

    @Builder.Default
    private List<String> options = new ArrayList<>();

    @Builder.Default
    private Map<String, String> votes = new HashMap<>(); // userId -> option

    private GroupDecisionStatus status;

    private LocalDateTime deadline;
}
