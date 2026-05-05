package com.campconnect.pricing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpatialMapDTO {
    private String campsiteId;
    private double baseDynamicPrice;
    
    // Geological properties
    private String regionType;
    private String waterFeatureName;
    
    // Points of Interest (x, y on a 0-100 scale)
    private int lakeX;
    private int lakeY;
    private int toiletX;
    private int toiletY;
    private int entranceX;
    private int entranceY;
    
    private List<PitchDTO> pitches;
}
