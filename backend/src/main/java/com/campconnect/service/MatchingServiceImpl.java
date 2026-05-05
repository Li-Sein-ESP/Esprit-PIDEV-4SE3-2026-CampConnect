package com.campconnect.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class MatchingServiceImpl implements MatchingService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public Double getCompatibilityScore(List<Double> profile1, List<Double> profile2) {

        String url = "http://127.0.0.1:8000/predict";

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("profile1", profile1);
        requestBody.put("profile2", profile2);

        ResponseEntity<Map> response =
                restTemplate.postForEntity(url, requestBody, Map.class);

        return Double.valueOf(
                response.getBody()
                        .get("compatibility_score_percent")
                        .toString()
        );
    }
}