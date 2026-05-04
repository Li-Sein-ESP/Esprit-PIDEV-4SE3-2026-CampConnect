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
<<<<<<< HEAD
=======
    private String content;
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
    private String postId;
    private String authorId;
    private String authorName;
    private String authorUsername;
<<<<<<< HEAD
    private String content;
    private int likes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
=======
    private LocalDateTime createdAt;
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
}
