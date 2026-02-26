package com.campconnect.dto;

import java.time.LocalDateTime;

import com.campconnect.model.GroupTaskStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupTaskDto {
    private String id;
    private String groupId;
    private String tripId;
    private String title;
    private String assignedToUserId;
    private GroupTaskStatus status;
    private LocalDateTime dueDate;
    private LocalDateTime createdAt;
}
