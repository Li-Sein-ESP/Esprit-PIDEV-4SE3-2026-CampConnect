package com.campconnect.academy.entity;
import com.campconnect.model.Comment;

import com.campconnect.model.User;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Pattern;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "videos")
public class Video {
    @Id
    private String id;
    
    @NotBlank(message = "Title is required")
    private String title;
    
    @NotBlank(message = "Description is required")
    private String description;
    
    @NotBlank(message = "Video URL is required")
    private String videoUrl;
    
    private String thumbnailUrl;
    
    @NotBlank(message = "Category is required")
    private String category; // survival, navigation, etc.
    
    @NotBlank(message = "Type is required")
    private String type; // REEL, EXPERIENCE, TUTORIAL
    private int views;
    private int helpfulCount;
    private LocalDateTime createdAt;

    @DBRef
    private User creator;

    private List<String> takeaways = new ArrayList<>();
    
    @DBRef
    private List<Comment> comments = new ArrayList<>();
}
