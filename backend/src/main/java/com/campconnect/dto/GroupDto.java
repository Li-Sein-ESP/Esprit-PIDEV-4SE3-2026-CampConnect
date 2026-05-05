package com.campconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;
import com.campconnect.model.GroupStatus;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupDto {
    private String id;
    private String name;
    private String description;
    private String tripId;
    private String creatorId;
    private String creatorUserId;
    private List<String> memberUserIds;
    private GroupStatus status;
    private int memberCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
