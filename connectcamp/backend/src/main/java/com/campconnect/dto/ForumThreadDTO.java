package com.campconnect.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import com.campconnect.enums.ForumStatus;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ForumThreadDTO {
    private String id;
    
    @NotBlank(message = "Thread title is required")
    private String title;
    
    private ForumStatus status;
    private LocalDateTime createdAt;
    private String creatorId;
    private String creatorName;
}
