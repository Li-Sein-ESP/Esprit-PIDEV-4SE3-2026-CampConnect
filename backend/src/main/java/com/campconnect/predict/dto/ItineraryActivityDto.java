package com.campconnect.predict.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItineraryActivityDto {
    private Long id;
    private String name;
    private String description;
    private String location;
    @com.fasterxml.jackson.annotation.JsonProperty("time_slot")
    private String timeSlot;
    private String type;
    private Double price;
    private Double duration;
    private String level;
    private String category;
}
