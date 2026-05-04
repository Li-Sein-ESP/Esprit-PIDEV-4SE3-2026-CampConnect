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
public class DemandForecastRequest {
    private List<CampsiteForecastRequest> campsites;
    
    @JsonProperty("target_month")
    private int targetMonth;
}
