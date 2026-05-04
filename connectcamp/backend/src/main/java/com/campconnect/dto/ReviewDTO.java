package com.campconnect.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDTO {
    private String id;
    private int rating;
    private String comment;
    private LocalDateTime createdAt;
    private String authorId;
    private String authorName;
    private String tripId;
}
