package com.campconnect.ml;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CampsiteForecastRequest {
    private String id;
    private String name;
    private String region;
    private int capacity;
    
    @JsonProperty("price_per_night")
    private double pricePerNight;
    
    private String activity;
    
    @JsonProperty("customer_type")
    private String customerType;
    
    private double rating;
}
