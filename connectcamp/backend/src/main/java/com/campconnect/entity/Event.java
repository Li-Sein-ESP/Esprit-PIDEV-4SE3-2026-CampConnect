package com.campconnect.entity;

import com.campconnect.model.User;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.campconnect.enums.EventStatus;
import com.campconnect.enums.DifficultyLevel;
import com.campconnect.enums.EventType;
import java.time.LocalDateTime;
import java.util.List;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import com.fasterxml.jackson.annotation.JsonFormat;

@Document(collection = "events")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Event {
    @Id
    private String id;
    
    @NotBlank(message = "Title is required")
    private String title;
    
    private String description;
    
    @NotBlank(message = "Type is required")
    private String type;
    
    @NotNull(message = "Location is required")
    private Location location;
    
    @NotNull(message = "Start date is required")
    private LocalDateTime startDate;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime endDate;
    
    @Positive(message = "Duration must be positive")
    private int duration;
    
    @Positive(message = "Capacity must be greater than 0")
    private int capacity;
    
    @PositiveOrZero(message = "Registered count cannot be negative")
    private int registered;
    
    @PositiveOrZero(message = "Price cannot be negative")
    private double price;
    
    @NotBlank(message = "Difficulty is required")
    private String difficulty;
    private List<String> tags;
    private String imageUrl;
    private String status;
    private List<String> whatToExpect;
    private List<String> whatToBring;
    private List<String> whatsIncluded;
    private List<String> safetyNotes;
    private String cancellationPolicy;

    @DBRef
    private Category category;

    @DBRef
    private User creator;
}
