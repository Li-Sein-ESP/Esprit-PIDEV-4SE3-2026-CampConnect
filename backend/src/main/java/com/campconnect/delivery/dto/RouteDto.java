package com.campconnect.delivery.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RouteDto {
    @NotBlank(message = "Route origin cannot be empty")
    private String origin;

    @NotBlank(message = "Route destination cannot be empty")
    private String destination;

    @NotBlank(message = "Estimated duration cannot be empty")
    private String estimatedDuration;
    
    private String notes;
}
