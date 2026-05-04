package com.campconnect.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentDTO {
    private String id;
    
    @NotBlank(message = "Comment content is required")
    private String content;
    
    private int upvotes;
    private LocalDateTime createdAt;
    private String postId;
    private String authorId;
    private String authorName;
}
