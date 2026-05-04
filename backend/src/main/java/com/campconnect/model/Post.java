package com.campconnect.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "posts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Post {

    @Id
    private String id;

    private String content;
    private String threadId;
    private String authorId;
    private String authorName;
    private String authorUsername;

    private String title;
    private String category;
    private List<String> tags = new ArrayList<>();
    private List<String> imageUrls = new ArrayList<>();
    private String location;
    private String moderationStatus = "PENDING_REVIEW";
    private String moderationDecision = "REVIEW";
    private Double moderationScore = 1.0;
    private List<String> moderationReasons = new ArrayList<>();

    private LocalDateTime createdAt = LocalDateTime.now();
    
    private int likes = 0;
    private List<String> likedByUsers = new ArrayList<>();

    private List<Comment> comments = new ArrayList<>();

    public void addComment(Comment comment) {
        comments.add(comment);
        comment.setPostId(this.id);
    }

    public void removeComment(Comment comment) {
        comments.remove(comment);
        comment.setPostId(null);
    }
}
