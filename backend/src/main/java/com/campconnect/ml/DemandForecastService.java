package com.campconnect.ml;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
public class DemandForecastService {

    private final RestTemplate restTemplate;

    @Value("${ml.forecast.url:http://localhost:5000}")
    private String mlUrl;

    public DemandForecastService(RestTemplateBuilder restTemplateBuilder) {
        this.restTemplate = restTemplateBuilder.build();
    }

    public DemandForecastResponse getForecast(List<CampsiteForecastRequest> campsites, int targetMonth) {
        DemandForecastRequest request = new DemandForecastRequest(campsites, targetMonth);
        
        try {
            ResponseEntity<DemandForecastResponse> response = restTemplate.postForEntity(
                    mlUrl + "/forecast",
                    request,
                    DemandForecastResponse.class
            );
            return response.getBody();
        } catch (ResourceAccessException e) {
            throw new RuntimeException("ML service unavailable. Make sure Flask is running on port 5000.", e);
        }
    }
}
