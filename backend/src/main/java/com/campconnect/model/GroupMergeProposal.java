package com.campconnect.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "group_merge_proposals")
public class GroupMergeProposal {
    @Id
    private String id;
    private String sourceGroupId;
    private String targetGroupId;
    private String targetTripTitle;
    private String status; // PENDING, ACCEPTED, REJECTED
    private String message;
    private Double matchScore;
    private boolean sourceAccepted;
    private boolean targetAccepted;
    private LocalDateTime createdAt;
}
