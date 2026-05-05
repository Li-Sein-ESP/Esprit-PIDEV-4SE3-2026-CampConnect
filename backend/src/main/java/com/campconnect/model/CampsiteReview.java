package com.campconnect.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "campsite_reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CampsiteReview {
    @Id
    private String id;
    
    private String campsiteId;
    private String userId;
    private String userName;
    private String userAvatar;
    
    // Rating out of 5
    private Integer rating;
    
    private String title;
    private String content;
    
    @Builder.Default
    private List<String> photos = new ArrayList<>();
    
    private boolean verifiedStay;
    
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    
    // List of user IDs who found this review helpful
    @Builder.Default
    private List<String> helpfulByUsers = new ArrayList<>();

    public int getHelpful() {
        return helpfulByUsers != null ? helpfulByUsers.size() : 0;
    }
}
