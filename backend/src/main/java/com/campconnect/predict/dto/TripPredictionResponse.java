package com.campconnect.predict.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TripPredictionResponse {
    private BigDecimal predictedBudget;
    private double cancellationProbability;
    private String budgetAdvice;
    private String cancellationAdvice;
    private String tripStyleSummary;
}
