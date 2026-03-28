package com.campconnect.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "forum_threads")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ForumThread {
    @Id
    private String id;
    private String title;
    private String content;
    private String description;
    private String authorId;
    private User author;
    private String category;
    @Builder.Default
    private List<String> tags = new ArrayList<>();
    private int views;
    private int likes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
