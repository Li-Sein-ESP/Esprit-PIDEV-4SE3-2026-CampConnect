package com.campconnect.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "forum_threads")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ForumThread {

    @Id
    private String id;

    private String title;

    private String description;
    private String category;
    private List<String> tags = new ArrayList<>();

    @DBRef
    private User author;

    private LocalDateTime createdAt = LocalDateTime.now();
    private int likes = 0;
    private int views = 0;

    private List<Post> posts = new ArrayList<>();

    public void addPost(Post post) {
        posts.add(post);
        post.setThreadId(this.id);
    }

    public void removePost(Post post) {
        posts.remove(post);
        post.setThreadId(null);
    }
}
