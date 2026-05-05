package com.campconnect.predict.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItineraryOptionDto {
    @com.fasterxml.jackson.annotation.JsonProperty("program_id")
    private Integer programId;
    private String title;
    @com.fasterxml.jackson.annotation.JsonProperty("budget_level")
    private String budgetLevel; // "low", "medium", "high"
    private String description;
    @com.fasterxml.jackson.annotation.JsonProperty("total_estimated_cost_tnd")
    private Double totalEstimatedCostTnd;
    @com.fasterxml.jackson.annotation.JsonProperty("average_per_person_tnd")
    private Double averagePerPersonTnd;
    private List<ItineraryDayDto> days;
}
