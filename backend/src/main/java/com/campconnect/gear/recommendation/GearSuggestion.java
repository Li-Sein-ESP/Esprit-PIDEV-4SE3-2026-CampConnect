package com.campconnect.gear.recommendation;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GearSuggestion {
    private String gearId;
    private String gearName;
    private String category;
    private String imageUrl;
    private double pricePerDay;
    private double averageRating;
    private boolean availableForDates;
    private String providerId;
}
