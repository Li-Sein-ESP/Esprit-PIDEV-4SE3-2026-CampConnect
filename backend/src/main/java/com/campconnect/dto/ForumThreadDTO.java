package com.campconnect.dto;

<<<<<<< HEAD
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;
=======
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import com.campconnect.enums.ForumStatus;
import java.time.LocalDateTime;
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ForumThreadDTO {
    private String id;
<<<<<<< HEAD
    private String title;
    private String content;
    private String description;
    private String authorId;
    private String authorName;
    private String authorUsername;
    private String category;
    private List<String> tags;
    private int views;
    private int likes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
=======
    
    @NotBlank(message = "Thread title is required")
    private String title;
    
    private ForumStatus status;
    private LocalDateTime createdAt;
    private String category;
    private String description;
    private java.util.List<String> tags;
    private int views;
    private int likes;
    private String authorId;
    private String authorName;
    private String authorUsername;
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
}
