package com.campconnect.dto;

import java.time.LocalDateTime;

import com.campconnect.model.TripIntentStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripIntentDTO {
    private String id;
    private String creatorUserId;
    private String title;
    private LocalDateTime dateFrom;
    private LocalDateTime dateTo;
    private Double budgetMax;
    private String campingStyle;
    private String experienceLevel;
    private String preferredZone;
    private TripIntentStatus status;
    private LocalDateTime createdAt;
}
