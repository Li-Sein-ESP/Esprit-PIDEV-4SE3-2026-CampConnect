package com.campconnect.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardEntryDTO {
    
    private String id;
    private String userId;
    private String username;
    private String handle; // @username format
    private String avatar;
    private String initials;
    private String avatarBg;
    private String avatarColor;
    
    private int rank;
    private int trustScore;
    private int points;
    private int rankChange;
    private int trips;
    private String joinedDate;
    
    private List<BadgeDto> badges = new ArrayList<>();
    
    private boolean isSelf;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BadgeDto {
        private String title;
        private String theme;
        private String icon;
    }
}
