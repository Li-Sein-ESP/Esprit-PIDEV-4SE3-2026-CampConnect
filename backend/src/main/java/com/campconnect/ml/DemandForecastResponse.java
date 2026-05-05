package com.campconnect.ml;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DemandForecastResponse {
    private List<CampsiteForecastResult> forecasts;
    
    @JsonProperty("analysis_month")
    private int analysisMonth;
    
    @JsonProperty("analysis_season")
    private String analysisSeason;
    
    @JsonProperty("total_campsites_analyzed")
    private int totalCampsitesAnalyzed;
    
    @JsonProperty("high_demand_count")
    private int highDemandCount;
    
    @JsonProperty("medium_demand_count")
    private int mediumDemandCount;
    
    @JsonProperty("low_demand_count")
    private int lowDemandCount;
}
