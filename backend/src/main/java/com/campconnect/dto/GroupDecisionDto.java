package com.campconnect.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import com.campconnect.model.GroupDecisionStatus;
import com.campconnect.model.GroupDecisionType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupDecisionDto {
    private String id;
    private String groupId;
    private String tripId;
    private GroupDecisionType type;
    private String question;
    private List<String> options;
    private Map<String, String> votes;
    private GroupDecisionStatus status;
    private LocalDateTime deadline;
}
