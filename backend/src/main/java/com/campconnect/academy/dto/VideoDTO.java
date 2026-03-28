package com.campconnect.academy.dto;

import com.campconnect.dto.CommentDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VideoDTO {
    private String id;
    
    @NotBlank(message = "Title is required")
    private String title;
    
    private String description;
    
    @NotBlank(message = "Video URL is required")
    private String videoUrl;
    
    private String thumbnailUrl;
    
    @NotBlank(message = "Category is required")
    private String category;
    
    @NotBlank(message = "Type is required")
    private String type;
    private int views;
    private int helpfulCount;
    private LocalDateTime createdAt;
    private UserSummaryDTO creator;
    private List<String> takeaways;
    private List<CommentDTO> comments;
}
