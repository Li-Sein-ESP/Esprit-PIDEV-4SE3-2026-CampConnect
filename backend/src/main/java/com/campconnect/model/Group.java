package com.campconnect.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "groups")
public class Group {
    @Id
    private String id;
    private String name;
    private String description;
    private String creatorUserId;
    private String tripId;
    private List<String> memberUserIds = new ArrayList<>();

    @DBRef
    private List<Trip> trips = new ArrayList<>();

    private GroupStatus status;

    @org.springframework.data.annotation.Transient
    private LocalDateTime startDate;
    @org.springframework.data.annotation.Transient
    private LocalDateTime endDate;

    @CreatedDate
    private LocalDateTime createdAt;

    public Group() {}

    public Group(String id, String name, String description, String creatorUserId, String tripId,
                 List<String> memberUserIds, List<Trip> trips, GroupStatus status, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.creatorUserId = creatorUserId;
        this.tripId = tripId;
        this.memberUserIds = memberUserIds != null ? memberUserIds : new ArrayList<>();
        this.trips = trips != null ? trips : new ArrayList<>();
        this.status = status;
        this.createdAt = createdAt;
    }

    public void addTrip(Trip trip) {
        if (this.trips == null) this.trips = new ArrayList<>();
        this.trips.add(trip);
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCreatorUserId() { return creatorUserId; }
    public void setCreatorUserId(String creatorUserId) { this.creatorUserId = creatorUserId; }

    public String getTripId() { return tripId; }
    public void setTripId(String tripId) { this.tripId = tripId; }

    public List<String> getMemberUserIds() { return memberUserIds; }
    public void setMemberUserIds(List<String> memberUserIds) { this.memberUserIds = memberUserIds; }

    public List<Trip> getTrips() { return trips; }
    public void setTrips(List<Trip> trips) { this.trips = trips; }

    public GroupStatus getStatus() { return status; }
    public void setStatus(GroupStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }

    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String id;
        private String name;
        private String description;
        private String creatorUserId;
        private String tripId;
        private List<String> memberUserIds = new ArrayList<>();
        private List<Trip> trips = new ArrayList<>();
        private GroupStatus status;
        private LocalDateTime createdAt;

        public Builder id(String id) { this.id = id; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder creatorUserId(String creatorUserId) { this.creatorUserId = creatorUserId; return this; }
        public Builder tripId(String tripId) { this.tripId = tripId; return this; }
        public Builder memberUserIds(List<String> memberUserIds) { this.memberUserIds = memberUserIds; return this; }
        public Builder trips(List<Trip> trips) { this.trips = trips; return this; }
        public Builder status(GroupStatus status) { this.status = status; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Group build() {
            return new Group(id, name, description, creatorUserId, tripId, memberUserIds, trips, status, createdAt);
        }
    }
}
