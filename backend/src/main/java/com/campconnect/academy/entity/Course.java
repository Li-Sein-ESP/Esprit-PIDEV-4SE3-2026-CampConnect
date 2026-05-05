package com.campconnect.academy.entity;

import com.campconnect.model.User;
import com.campconnect.model.Category;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.campconnect.enums.DifficultyLevel;
import org.springframework.data.mongodb.core.mapping.DBRef;
import com.campconnect.enums.CourseStatus;
import java.util.List;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;

@Document(collection = "courses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Course {
    @Id
    private String id;
    
    @NotBlank(message = "Title is required")
    private String title;
    
    @NotBlank(message = "Description is required")
    private String description;

    @DBRef
    @NotNull(message = "Category is required")
    private Category category; 

    @NotBlank(message = "Difficulty is required")
    private String difficulty;
    
    @Positive(message = "Duration must be positive")
    private int duration;
    
    @PositiveOrZero(message = "Enrolled count cannot be negative")
    private int enrolledCount;
    
    @Min(0) @Max(5)
    private double rating;
    
    @PositiveOrZero(message = "Reviews count cannot be negative")
    private int reviews;
    
    @PositiveOrZero(message = "Price cannot be negative")
    private double price;
    
    private String imageUrl;
    private String documentUrl;
    private List<String> tags;
    private List<String> prerequisites;
    private List<String> sdgs;
    
    @Min(value = 0, message = "Passing score must be at least 0")
    private int passingScore;

    private CourseStatus status = CourseStatus.PENDING;

    @DBRef
    private User creator;

    @DBRef
    private User instructor;
}
