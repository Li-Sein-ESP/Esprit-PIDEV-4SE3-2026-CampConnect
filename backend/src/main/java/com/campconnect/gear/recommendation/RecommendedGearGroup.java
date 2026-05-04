package com.campconnect.gear.recommendation;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecommendedGearGroup {
    private String priority;
    private List<GearSuggestion> items;
}
