package com.campconnect.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupTaskDTO {
    private String id;
    
    @NotBlank
    private String groupId;
    
    @NotBlank
    private String title;
    
    private String assignedUserId;
    
    private Boolean isCompleted;
    
    private LocalDateTime createdAt;
}
