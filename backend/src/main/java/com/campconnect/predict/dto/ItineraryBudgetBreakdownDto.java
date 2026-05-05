package com.campconnect.predict.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItineraryBudgetBreakdownDto {
    private Double transport;
    private Double hebergement;
    private Double nourriture;
    private Double activites;
    private Double total;
}
