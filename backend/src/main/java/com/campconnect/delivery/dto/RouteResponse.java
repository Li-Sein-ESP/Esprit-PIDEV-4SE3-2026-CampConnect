package com.campconnect.delivery.dto;

import java.util.List;
import lombok.Data;

@Data
public class RouteResponse {
    private double distanceKm;
    private double durationMinutes;
    private List<List<Double>> geometryRaw;
}
