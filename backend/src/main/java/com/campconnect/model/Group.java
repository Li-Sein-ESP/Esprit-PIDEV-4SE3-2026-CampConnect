package com.campconnect.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "groups")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Group {
    @Id
    private String id;

    private String name;

    private String description;

    private String creatorUserId;

    private String tripId;

    @Builder.Default
    private List<String> memberUserIds = new ArrayList<>();

    private GroupStatus status;

    @CreatedDate
    private LocalDateTime createdAt;
    
    public void addTrip(Trip trip) {
        this.tripId = trip.getId();
    }
}
