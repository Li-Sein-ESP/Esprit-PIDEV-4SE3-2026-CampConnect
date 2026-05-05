package com.campconnect.predict.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItineraryBudgetPredictRequest {
    private Integer programId;
    @JsonProperty("user_proposed_budget_tnd")
    private Double userProposedBudgetTnd;
    private String transportMode;
    /**
     * Optionnel: coût de transport saisi par l'utilisateur.
     * Exemple:
     * - train/bus: coût du ticket par personne
     * - voiture (location): coût par jour pour le groupe
     */
    private Double transportCostTnd;
    /**
     * Optionnel: modèle de coût transport.
     * - per_person: coût par personne (ticket)
     * - per_day_group: coût par jour pour le groupe (location/jour)
     * - flat_group: coût forfaitaire groupe (un seul montant)
     */
    private String transportCostType;
    private List<Long> selectedActivityIds;
    private List<String> selectedActivityNames;
    private List<ItineraryActivityDto> selectedActivities;
    private Integer numPeople;
    private Boolean includeFood;
    private Boolean includeAccommodation;
}
