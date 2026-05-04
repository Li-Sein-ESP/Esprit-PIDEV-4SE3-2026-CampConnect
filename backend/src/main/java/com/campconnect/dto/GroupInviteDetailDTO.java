package com.campconnect.dto;

import com.campconnect.model.GroupInviteStatus;
import com.campconnect.model.TripIntent;
import com.campconnect.model.User;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class GroupInviteDetailDTO {
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
}
