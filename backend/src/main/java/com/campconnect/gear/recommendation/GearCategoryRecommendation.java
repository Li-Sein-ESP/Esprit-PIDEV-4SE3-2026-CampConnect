package com.campconnect.gear.recommendation;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GearCategoryRecommendation {
    private String category;
    private String priority;
}
