package com.campconnect.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
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
