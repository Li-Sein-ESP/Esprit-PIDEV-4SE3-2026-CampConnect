package com.campconnect.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ForumThreadDTO {
    private String id;
    private String title;
    private String description;
    private String authorId;
    private String category;
    private java.util.List<String> tags;
    private LocalDateTime createdAt;
    private int likes;
    private int views;
}
