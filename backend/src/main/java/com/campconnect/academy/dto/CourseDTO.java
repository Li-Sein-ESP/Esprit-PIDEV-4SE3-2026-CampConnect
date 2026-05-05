package com.campconnect.academy.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import com.campconnect.enums.DifficultyLevel;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;
import com.campconnect.enums.CourseStatus;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class CourseDTO {
    private String id;
    
    @NotBlank(message = "Title is required")
    private String title;
    
    @NotBlank(message = "Description is required")
    private String description;
    
    @NotBlank(message = "Category is required")
    @com.fasterxml.jackson.annotation.JsonProperty("category")
    private String categoryName;
    
    private DifficultyLevel difficulty;
    
    @Positive(message = "Duration must be positive")
    private int duration;
    private int enrolledCount;
    private double rating;
    private int reviews;
    @PositiveOrZero(message = "Price must be 0 or positive")
    private double price;
    private String imageUrl;
    private String documentUrl;
    private List<String> tags;
    private List<String> prerequisites;
    private List<String> sdgs;
    
    @Min(value = 0, message = "Passing score must be at least 0")
    private int passingScore;
    
    private String creatorId;
    private String creatorName;

    private String instructorId;
    private String instructorName;
    private CourseStatus status;
}
