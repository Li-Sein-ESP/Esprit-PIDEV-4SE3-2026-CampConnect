package com.campconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostDTO {
    private String id;
    private String threadId;
    private String authorId;
    private String authorName;
    private String content;
    private List<String> imageUrls;
    private int likes;
    private int commentCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
