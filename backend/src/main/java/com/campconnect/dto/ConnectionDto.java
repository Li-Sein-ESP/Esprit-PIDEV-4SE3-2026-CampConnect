package com.campconnect.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ConnectionDto {

    @NotBlank(message = "Sender ID is required")
    private String fromUserId;
    @NotBlank(message = "Sender Name is required")
    private String fromUserName;
    private String fromUserAvatar;
    @NotBlank(message = "Receiver ID is required")
    private String toUserId;
    @NotBlank(message = "Receiver Name is required")
    private String toUserName;
    private String toUserAvatar;
    private String campingStyle;
    private String experienceLevel;
    @NotNull(message = "Match score is required")
    private Double matchScore;
    private String message;

    public ConnectionDto() {
    }

    public ConnectionDto(String fromUserId, String fromUserName, String fromUserAvatar, String toUserId,
            String toUserName, String toUserAvatar, String campingStyle, String experienceLevel, Double matchScore,
            String message) {
        this.fromUserId = fromUserId;
        this.fromUserName = fromUserName;
        this.fromUserAvatar = fromUserAvatar;
        this.toUserId = toUserId;
        this.toUserName = toUserName;
        this.toUserAvatar = toUserAvatar;
        this.campingStyle = campingStyle;
        this.experienceLevel = experienceLevel;
        this.matchScore = matchScore;
        this.message = message;
    }

    public String getFromUserId() {
        return fromUserId;
    }

    public void setFromUserId(String fromUserId) {
        this.fromUserId = fromUserId;
    }

    public String getFromUserName() {
        return fromUserName;
    }

    public void setFromUserName(String fromUserName) {
        this.fromUserName = fromUserName;
    }

    public String getFromUserAvatar() {
        return fromUserAvatar;
    }

    public void setFromUserAvatar(String fromUserAvatar) {
        this.fromUserAvatar = fromUserAvatar;
    }

    public String getToUserId() {
        return toUserId;
    }

    public void setToUserId(String toUserId) {
        this.toUserId = toUserId;
    }

    public String getToUserName() {
        return toUserName;
    }

    public void setToUserName(String toUserName) {
        this.toUserName = toUserName;
    }

    public String getToUserAvatar() {
        return toUserAvatar;
    }

    public void setToUserAvatar(String toUserAvatar) {
        this.toUserAvatar = toUserAvatar;
    }

    public String getCampingStyle() {
        return campingStyle;
    }

    public void setCampingStyle(String campingStyle) {
        this.campingStyle = campingStyle;
    }

    public String getExperienceLevel() {
        return experienceLevel;
    }

    public void setExperienceLevel(String experienceLevel) {
        this.experienceLevel = experienceLevel;
    }

    public Double getMatchScore() {
        return matchScore;
    }

    public void setMatchScore(Double matchScore) {
        this.matchScore = matchScore;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
