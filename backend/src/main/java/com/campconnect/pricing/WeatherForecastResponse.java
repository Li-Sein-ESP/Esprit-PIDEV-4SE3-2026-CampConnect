package com.campconnect.pricing;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

/**
 * Lightweight mapping of the Open-Meteo /v1/forecast response.
 * Only the daily fields we need for pricing are mapped.
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class WeatherForecastResponse {

    @JsonProperty("daily")
    private Daily daily;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Daily {
        @JsonProperty("temperature_2m_max")
        private List<Double> temperatureMax;

        @JsonProperty("precipitation_sum")
        private List<Double> precipitationSum;

        @JsonProperty("sunshine_duration")
        private List<Double> sunshineDuration;
    }

    /** Returns tomorrow's max temperature, or 20°C as a safe default. */
    public double getTomorrowTempMax() {
        try { return daily.getTemperatureMax().get(1); } catch (Exception e) { return 20.0; }
    }

    /** Returns tomorrow's precipitation in mm, or 0 as a safe default. */
    public double getTomorrowPrecipitation() {
        try { return daily.getPrecipitationSum().get(1); } catch (Exception e) { return 0.0; }
    }

    /** Returns tomorrow's sunshine duration in seconds, or 21600 (6h) as safe default. */
    public double getTomorrowSunshineDuration() {
        try { return daily.getSunshineDuration().get(1); } catch (Exception e) { return 21600.0; }
    }
}
