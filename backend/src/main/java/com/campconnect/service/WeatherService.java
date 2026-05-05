package com.campconnect.service;

import com.campconnect.predict.service.OpenAIService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class WeatherService {

    @org.springframework.beans.factory.annotation.Value("${weather.api.key}")
    private String apiKey;

    @org.springframework.beans.factory.annotation.Value("${weather.api.url}")
    private String baseUrl;

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Récupère la météo via WeatherAPI.com (supporte nom de ville ou coordonnées).
     */
    public Map<String, Object> getCurrentWeather(String location) {
        if (location == null || location.isBlank()) location = "Tunis";
        
        try {
            String encodedLocation = java.net.URLEncoder.encode(location, java.nio.charset.StandardCharsets.UTF_8.toString());
            String url = String.format("%s/current.json?key=%s&q=%s", baseUrl, apiKey, encodedLocation);
            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(response);
            JsonNode current = root.path("current");

            Map<String, Object> weatherMap = new HashMap<>();
            weatherMap.put("temp", current.path("temp_c").asDouble());
            weatherMap.put("windspeed", current.path("wind_kph").asDouble());
            weatherMap.put("condition", current.path("condition").path("text").asText());
            weatherMap.put("icon", current.path("condition").path("icon").asText());
            
            return weatherMap;
        } catch (org.springframework.web.client.HttpClientErrorException.BadRequest e) {
            log.warn("Location {} not found, falling back to Tunis", location);
            if (!"Tunis".equals(location)) {
                return getCurrentWeather("Tunis");
            }
            return null;
        } catch (Exception e) {
            log.error("Error fetching weather for {}: {}", location, e.getMessage());
            return null;
        }
    }

    /**
     * Donne un conseil basé sur la météo du lieu.
     */
    public String getTripWeatherAdvice(String location) {
        Map<String, Object> weather = getCurrentWeather(location);
        if (weather == null) return "Impossible de récupérer la météo pour le moment.";

        double temp = (double) weather.get("temp");
        String condition = (String) weather.get("condition");

        return String.format("Météo à %s : %s (%.1f°C). Conseil : %s", 
                location, 
                condition, 
                temp, 
                temp < 15 ? "Prévoyez des vêtements chauds." : "Le temps est idéal pour camper !");
    }
}
