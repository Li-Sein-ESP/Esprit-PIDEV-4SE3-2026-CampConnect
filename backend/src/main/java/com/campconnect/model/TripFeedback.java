package com.campconnect.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "trip_feedbacks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripFeedback {
    @Id
    private String id;
    
    private String tripId;
    private String evaluatorUserId;
    private String evaluatedUserId;
    
    private Integer rating; // 1-5
    private String comment;
    
    @CreatedDate
    private LocalDateTime createdAt;
}
