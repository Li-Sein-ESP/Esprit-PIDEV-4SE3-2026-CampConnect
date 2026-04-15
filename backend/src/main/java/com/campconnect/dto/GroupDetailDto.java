package com.campconnect.dto;

import java.util.List;
import com.campconnect.model.GroupStatus;
import com.campconnect.model.User;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupDetailDTO {
    private String id;
    private String name;
    private String tripId;
    private String creatorUserId;
    private GroupStatus status;
    private List<User> members; // Resolved users instead of just IDs
}
