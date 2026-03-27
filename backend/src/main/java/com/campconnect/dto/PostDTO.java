package com.campconnect.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PostDTO {
    private String id;
    private String content;
    private String description; // Support for alternate naming from frontend
    private String threadId;
    private String authorId;
    private String authorName;
    private String authorUsername;
    private LocalDateTime createdAt;
}
