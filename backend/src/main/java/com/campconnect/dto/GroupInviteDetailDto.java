package com.campconnect.dto;

import com.campconnect.model.GroupInviteStatus;
import com.campconnect.model.TripIntent;
import com.campconnect.model.User;
import lombok.Data;
import java.time.LocalDateTime;

@Data
 public class GroupInviteDetailDto {
    private String id;
    private String tripIntentId;
    private String groupId;
    private String fromUserId;
    private String toUserId;
    private String message;
    private GroupInviteStatus status;
    private LocalDateTime createdAt;
    
    // Resolved entities (Aligned with frontend property names)
    private User sender;
    private User receiver;
    private TripIntent trip;

    // AI Prediction fields
    private Double compatibilityScore;
    private String aiInsight;
    private java.util.Map<String, Double> traitScores;
}
