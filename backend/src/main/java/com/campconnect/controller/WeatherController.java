package com.campconnect.controller;

import com.campconnect.service.WeatherService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/external/weather")
@RequiredArgsConstructor
@CrossOrigin("*")
public class WeatherController {

    private final WeatherService weatherService;

    @GetMapping("/current")
    public Map<String, Object> getWeather(@RequestParam String location) {
        return weatherService.getCurrentWeather(location);
    }

    @GetMapping("/advice")
    public String getAdvice(@RequestParam String location) {
        return weatherService.getTripWeatherAdvice(location);
    }
}
