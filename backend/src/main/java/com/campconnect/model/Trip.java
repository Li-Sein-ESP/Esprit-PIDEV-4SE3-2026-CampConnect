package com.campconnect.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "trips")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Trip {

    @Id
    private String id;

    private String name;
    private String destination;
    private String notes;

    private LocalDateTime startDate;
    private LocalDateTime endDate;

    private DifficultyLevel difficulty;

    @DBRef
    private Group group;

    @DBRef
    private List<Incident> incidents = new ArrayList<>();

    @DBRef
    private List<SafetyAlert> alerts = new ArrayList<>();

    public void addIncident(Incident incident) {
        incidents.add(incident);
        incident.setTrip(this);
    }

    public void removeIncident(Incident incident) {
        incidents.remove(incident);
        incident.setTrip(null);
    }

    public void addSafetyAlert(SafetyAlert alert) {
        alerts.add(alert);
        alert.setTrip(this);
    }

    public void removeSafetyAlert(SafetyAlert alert) {
        alerts.remove(alert);
        alert.setTrip(null);
    }
}
