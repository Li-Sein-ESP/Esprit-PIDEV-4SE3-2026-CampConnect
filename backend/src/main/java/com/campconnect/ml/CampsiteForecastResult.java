package com.campconnect.ml;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CampsiteForecastResult {
    @JsonProperty("campsite_id")
    private String campsiteId;
    
    @JsonProperty("campsite_name")
    private String campsiteName;
    
    private String region;
    private String season;
    
    @JsonProperty("target_month")
    private int targetMonth;
    
    @JsonProperty("demand_level")
    private String demandLevel;
    
    @JsonProperty("demand_score")
    private double demandScore;
    
    private Map<String, Double> probabilities;
    
    @JsonProperty("pricing_recommendation")
    private String pricingRecommendation;
    
    @JsonProperty("weather_advice")
    private String weatherAdvice;
    
    @JsonProperty("staffing_recommendation")
    private String staffingRecommendation;
    
    @JsonProperty("activity_suggestions")
    private List<String> activitySuggestions;
}
