package com.campconnect.predict.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItineraryBudgetPredictionResponse {
    private String status;
    @JsonProperty("budget_level")
    private String budgetLevel;
    @JsonProperty("total_budget_tnd")
    private Double totalBudgetTnd;
    @JsonProperty("per_person_tnd")
    private Double perPersonTnd;
    private ItineraryBudgetBreakdownDto breakdown;
    @JsonProperty("budget_status")
    private String budgetStatus;
    @JsonProperty("budget_advice")
    private String budgetAdvice;
    @JsonProperty("cancellation_probability")
    private Double cancellationProbability;
    @JsonProperty("risk_level")
    private String riskLevel;
    @JsonProperty("predicted_total_budget_tnd")
    private Double predictedTotalBudgetTnd;
    @JsonProperty("estimated_total_budget_tnd")
    private Double estimatedTotalBudgetTnd;
    private String timestamp;
}
