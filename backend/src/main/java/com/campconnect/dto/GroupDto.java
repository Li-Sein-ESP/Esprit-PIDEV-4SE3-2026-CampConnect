package com.campconnect.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.campconnect.model.GroupStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupDto {
    private String id;
    private String name;
    private String creatorUserId;
    private String tripId;
    private List<String> memberUserIds;
    private GroupStatus status;
    private LocalDateTime createdAt;
}
