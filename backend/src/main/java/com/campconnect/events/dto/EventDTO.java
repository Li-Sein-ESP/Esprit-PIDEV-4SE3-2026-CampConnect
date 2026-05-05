package com.campconnect.events.dto;

import com.campconnect.model.Location;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.campconnect.enums.EventStatus;
import com.campconnect.enums.DifficultyLevel;
import com.campconnect.enums.EventType;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class EventDTO {
    private String id;
    
    @NotBlank(message = "Title is required")
    private String title;
    
    private String description;
    
    @NotBlank(message = "Category is required")
    private String categoryName;
    
    @NotNull(message = "Event type is required")
    private EventType type;
    private Location location;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime startDate;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime endDate;
    
    private int duration;
    @Positive(message = "Capacity must be greater than 0")
    private int capacity;
    private int registered;
    
    @PositiveOrZero(message = "Price must be 0 or positive")
    private double price;
    private DifficultyLevel difficulty;
    private List<String> tags;
    private String imageUrl;
    private EventStatus status;
    private List<String> sdgs;
    private Integer sustainabilityScore;
    private List<String> activities;
    private String creatorId;
    private String creatorName;
}
