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
public class ItineraryOptionsResponse {
    private String status;
    private String message;
    private String region;
    private String season;
    @com.fasterxml.jackson.annotation.JsonProperty("duration_days")
    private Integer durationDays;
    @com.fasterxml.jackson.annotation.JsonProperty("num_people")
    private Integer numPeople;
    private List<ItineraryOptionDto> programs;
}
