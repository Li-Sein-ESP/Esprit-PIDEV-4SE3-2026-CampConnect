package com.campconnect.delivery.service;

import com.campconnect.delivery.dto.RouteResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class RouteService {

    @Value("${ors.api.key}")
    private String orsApiKey;

    private static final String ORS_API_URL = "https://api.openrouteservice.org/v2/directions/driving-car";
    private final RestTemplate restTemplate;

    public RouteService() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(3000);
        factory.setReadTimeout(5000);
        this.restTemplate = new RestTemplate(factory);
    }

    public RouteResponse estimateRoute(Double warehouseLat, Double warehouseLng, Double customerLat, Double customerLng) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", orsApiKey);

        Map<String, Object> requestBody = new HashMap<>();
        // OpenRouteService expects coordinates as [longitude, latitude] arrays
        requestBody.put("coordinates", List.of(
                List.of(warehouseLng, warehouseLat),
                List.of(customerLng, customerLat)
        ));
        requestBody.put("geometry_format", "geojson");

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        
        RouteResponse routeResponse = new RouteResponse();
        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(ORS_API_URL, entity, Map.class);
            Map<String, Object> body = response.getBody();
            if (body != null && body.containsKey("routes")) {
                List<Map<String, Object>> routes = (List<Map<String, Object>>) body.get("routes");
                if (!routes.isEmpty()) {
                    Map<String, Object> summary = (Map<String, Object>) routes.get(0).get("summary");
                    double distanceMeters = ((Number) summary.get("distance")).doubleValue();
                    double durationSeconds = ((Number) summary.get("duration")).doubleValue();

                    routeResponse.setDistanceKm(distanceMeters / 1000.0);
                    routeResponse.setDurationMinutes(durationSeconds / 60.0);
                    
                    // We extract the actual raw coordinates from the geojson to array
                    Map<String, Object> geometry = (Map<String, Object>) routes.get(0).get("geometry");
                    routeResponse.setGeometryRaw((List<List<Double>>) geometry.get("coordinates"));
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error calling OpenRouteService: " + e.getMessage());
        }
        
        return routeResponse;
    }
}
