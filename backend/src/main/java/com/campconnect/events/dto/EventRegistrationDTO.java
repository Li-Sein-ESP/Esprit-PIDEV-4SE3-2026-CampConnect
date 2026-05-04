package com.campconnect.events.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventRegistrationDTO {
    private String id;
    
    @NotBlank(message = "User ID is required")
    private String userId;
    
    private String username;
    
    @NotBlank(message = "Event ID is required")
    private String eventId;
    
    private String eventTitle;
    private LocalDateTime registrationDate;
    @NotBlank(message = "Status is required")
    private String status;
    
    @Min(value = 1, message = "Participants must be at least 1")
    private int participants;
}
