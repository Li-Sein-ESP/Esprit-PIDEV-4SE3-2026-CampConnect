package com.campconnect.delivery.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RouteDto {
    private String origin;
    private String destination;
    private String estimatedDuration;
    private String notes;
}
