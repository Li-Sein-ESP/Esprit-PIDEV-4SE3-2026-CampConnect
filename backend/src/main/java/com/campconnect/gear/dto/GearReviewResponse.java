package com.campconnect.gear.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class GearReviewResponse {
    private String id;
    private String gearId;
    private String reviewerId;
    private String reviewerName;
    private int rating;
    private String comment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
