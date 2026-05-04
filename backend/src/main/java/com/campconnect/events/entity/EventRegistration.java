package com.campconnect.events.entity;

import com.campconnect.model.User;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.NotBlank;

@Document(collection = "event_registrations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventRegistration {
    @Id
    private String id;
    
    @DBRef
    @NotNull(message = "User is required")
    private User user;
    
    @DBRef
    @NotNull(message = "Event is required")
    private Event event;
    
    @NotNull(message = "Registration date is required")
    private LocalDateTime registrationDate;
    
    @NotBlank(message = "Status is required")
    private String status; // e.g., "CONFIRMED", "CANCELLED"
    
    @Positive(message = "Participants must be at least 1")
    private int participants;
}
