package com.campconnect.gear.recommendation;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class FlaskRecommendationResponse {
    private String destination;
    private String terrain;
    private String season;
    private List<GearCategoryRecommendation> recommendations;
}
