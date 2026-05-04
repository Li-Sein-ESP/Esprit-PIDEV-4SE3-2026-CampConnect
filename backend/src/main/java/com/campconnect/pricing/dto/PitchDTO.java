package com.campconnect.pricing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PitchDTO {
    private String id;
    private String name;
    private int x;
    private int y;
    private double spatialMultiplier;
    private double finalPrice;
    private String status; // "AVAILABLE", "BOOKED"
}
