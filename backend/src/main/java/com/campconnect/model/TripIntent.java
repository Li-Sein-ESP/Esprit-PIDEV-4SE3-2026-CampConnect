package com.campconnect.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "trip_intents")
public class TripIntent {
    @Id
    private String id;

    private String creatorUserId;
    private String title;
    private LocalDateTime dateFrom;
    private LocalDateTime dateTo;
    private Double budgetMax;
    private String campingStyle;
    private String experienceLevel;
    private String preferredZone;
    private TripIntentStatus status;
    private String imageUrl;

    @com.fasterxml.jackson.annotation.JsonProperty("isTrending")
    @Field("isTrending")
    private boolean isTrending;

    @CreatedDate
    private LocalDateTime createdAt;

    @org.springframework.data.annotation.Transient
    private Double compatibilityScore;

    @org.springframework.data.annotation.Transient
    private java.util.Map<String, Double> participantScores = new java.util.HashMap<>();

    @org.springframework.data.annotation.Transient
    private String creatorName;

    @org.springframework.data.annotation.Transient
    private String groupId;

    // Constructors
    public TripIntent() {}

    public TripIntent(String id, String creatorUserId, String title, LocalDateTime dateFrom, LocalDateTime dateTo, 
                      Double budgetMax, String campingStyle, String experienceLevel, String preferredZone, 
                      TripIntentStatus status, boolean isTrending, LocalDateTime createdAt, String imageUrl) {
        this.id = id;
        this.creatorUserId = creatorUserId;
        this.title = title;
        this.dateFrom = dateFrom;
        this.dateTo = dateTo;
        this.budgetMax = budgetMax;
        this.campingStyle = campingStyle;
        this.experienceLevel = experienceLevel;
        this.preferredZone = preferredZone;
        this.status = status;
        this.isTrending = isTrending;
        this.createdAt = createdAt;
        this.imageUrl = imageUrl;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCreatorUserId() { return creatorUserId; }
    public void setCreatorUserId(String creatorUserId) { this.creatorUserId = creatorUserId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public LocalDateTime getDateFrom() { return dateFrom; }
    public void setDateFrom(LocalDateTime dateFrom) { this.dateFrom = dateFrom; }

    public LocalDateTime getDateTo() { return dateTo; }
    public void setDateTo(LocalDateTime dateTo) { this.dateTo = dateTo; }

    public Double getBudgetMax() { return budgetMax; }
    public void setBudgetMax(Double budgetMax) { this.budgetMax = budgetMax; }

    public String getCampingStyle() { return campingStyle; }
    public void setCampingStyle(String campingStyle) { this.campingStyle = campingStyle; }

    public String getExperienceLevel() { return experienceLevel; }
    public void setExperienceLevel(String experienceLevel) { this.experienceLevel = experienceLevel; }

    public String getPreferredZone() { return preferredZone; }
    public void setPreferredZone(String preferredZone) { this.preferredZone = preferredZone; }

    public TripIntentStatus getStatus() { return status; }
    public void setStatus(TripIntentStatus status) { this.status = status; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public boolean isTrending() { return isTrending; }
    public void setTrending(boolean trending) { isTrending = trending; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Double getCompatibilityScore() { return compatibilityScore; }
    public void setCompatibilityScore(Double compatibilityScore) { this.compatibilityScore = compatibilityScore; }

    public java.util.Map<String, Double> getParticipantScores() { return participantScores; }
    public void setParticipantScores(java.util.Map<String, Double> participantScores) { this.participantScores = participantScores; }

    public String getCreatorName() { return creatorName; }
    public void setCreatorName(String creatorName) { this.creatorName = creatorName; }

    public String getGroupId() { return groupId; }
    public void setGroupId(String groupId) { this.groupId = groupId; }

    // Manual Builder Pattern
    public static TripIntentBuilder builder() {
        return new TripIntentBuilder();
    }

    public static class TripIntentBuilder {
        private String id;
        private String creatorUserId;
        private String title;
        private LocalDateTime dateFrom;
        private LocalDateTime dateTo;
        private Double budgetMax;
        private String campingStyle;
        private String experienceLevel;
        private String preferredZone;
        private TripIntentStatus status;
        private boolean isTrending;
        private LocalDateTime createdAt;
        private String imageUrl;

        public TripIntentBuilder id(String id) { this.id = id; return this; }
        public TripIntentBuilder creatorUserId(String creatorUserId) { this.creatorUserId = creatorUserId; return this; }
        public TripIntentBuilder title(String title) { this.title = title; return this; }
        public TripIntentBuilder dateFrom(LocalDateTime dateFrom) { this.dateFrom = dateFrom; return this; }
        public TripIntentBuilder dateTo(LocalDateTime dateTo) { this.dateTo = dateTo; return this; }
        public TripIntentBuilder budgetMax(Double budgetMax) { this.budgetMax = budgetMax; return this; }
        public TripIntentBuilder campingStyle(String campingStyle) { this.campingStyle = campingStyle; return this; }
        public TripIntentBuilder experienceLevel(String experienceLevel) { this.experienceLevel = experienceLevel; return this; }
        public TripIntentBuilder preferredZone(String preferredZone) { this.preferredZone = preferredZone; return this; }
        public TripIntentBuilder status(TripIntentStatus status) { this.status = status; return this; }
        public TripIntentBuilder isTrending(boolean isTrending) { this.isTrending = isTrending; return this; }
        public TripIntentBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public TripIntentBuilder imageUrl(String imageUrl) { this.imageUrl = imageUrl; return this; }

        public TripIntent build() {
            return new TripIntent(id, creatorUserId, title, dateFrom, dateTo, budgetMax, campingStyle, experienceLevel, preferredZone, status, isTrending, createdAt, imageUrl);
        }
    }
}
