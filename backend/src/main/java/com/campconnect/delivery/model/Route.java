package com.campconnect.delivery.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Route {
    private String origin;
    private String destination;
    private String estimatedDuration; // e.g. "2h 30m"
    private String notes;
}
