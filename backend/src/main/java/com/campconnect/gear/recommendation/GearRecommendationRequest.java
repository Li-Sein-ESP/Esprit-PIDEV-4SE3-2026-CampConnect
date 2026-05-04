package com.campconnect.gear.recommendation;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class GearRecommendationRequest {
    private String destination;
    private int month;
    private int durationDays;
    private int groupSize;
    private String activity;
    private String experienceLevel;

    // startDate and endDate for rental availability check
    private String startDate; // format: yyyy-MM-dd
    private String endDate;   // format: yyyy-MM-dd
    private Double budget;    // optional, TND
}
