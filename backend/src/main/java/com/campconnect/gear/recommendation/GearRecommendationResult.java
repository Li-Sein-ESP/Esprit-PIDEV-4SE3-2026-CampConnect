package com.campconnect.gear.recommendation;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GearRecommendationResult {
    private String destination;
    private String terrain;
    private String season;
    private List<RecommendedGearGroup> groups;
}
