package com.campconnect.predict.ml;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;

@Service
public class DemandPredictionService {

    private final RestTemplate restTemplate;

    @Value("${ml.api.url:http://localhost:5000}")
    private String mlApiUrl;

    public DemandPredictionService(RestTemplateBuilder builder) {
        this.restTemplate = builder.build();
    }

    public DemandPredictionResponse predictDemand(DemandPredictionRequest request) {
        String url = mlApiUrl + "/predict";
        ResponseEntity<DemandPredictionResponse> response =
            restTemplate.postForEntity(url, request, DemandPredictionResponse.class);
        return response.getBody();
    }
}
