package com.campconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentDTO {
    private String id;
    private String content;
    private String postId;
    private String authorId;
    private String authorName;
    private String authorUsername;
    private LocalDateTime createdAt;
}
