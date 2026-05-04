package com.campconnect.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "user_stats")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserStats {
    
    @Id
    private String id;
    
    private String userId;
    private String username;
    private String email;
    
    // Points & Ranking
    private int totalPoints;
    private int weeklyPoints;
    private int monthlyPoints;
    private int yearlyPoints;
    
    // Trust Score (0-100)
    private int trustScore;
    
    // Activity counts
    private int postsCount;
    private int commentsCount;
    private int tripsCount;
    private int incidentsReportedCount;
    private int helpfulVotesReceived;
    
    // Badges earned
    private List<Badge> badges = new ArrayList<>();
    
    // Rank change (+/- from previous period)
    private int rankChange;

    // ── Champs pour le Scheduler "Comptes Suspects" ─────────────────────
    // Flag mis à jour par le SuspectAccountScheduler chaque dimanche
    private boolean suspectFlag = false;
    private LocalDateTime flaggedAt;
    
    // Timestamps
    private LocalDateTime joinedAt;
    private LocalDateTime lastActiveAt;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Badge {
        private String id;
        private String title;
        private String theme; // forest, amber, gold, terra, slate, sage, teal
        private String icon;  // tent, fire, star, trail, binoculars, moon, leaf
        private LocalDateTime earnedAt;
    }
    
    // Calculate trust score based on activity
    public void recalculateTrustScore() {
        int score = 50; // Base score
        score += Math.min(postsCount * 2, 20);      // Max 20 from posts
        score += Math.min(commentsCount, 15);       // Max 15 from comments
        score += Math.min(tripsCount * 3, 15);      // Max 15 from trips
        score += Math.min(helpfulVotesReceived, 10); // Max 10 from votes
        score += Math.min(badges.size() * 2, 10);   // Max 10 from badges
        this.trustScore = Math.min(score, 100);
    }
    
    // Add points for various activities
    public void addPointsForPost() {
        this.totalPoints += 10;
        this.weeklyPoints += 10;
        this.monthlyPoints += 10;
        this.yearlyPoints += 10;
        this.postsCount++;
    }
    
    public void addPointsForComment() {
        this.totalPoints += 5;
        this.weeklyPoints += 5;
        this.monthlyPoints += 5;
        this.yearlyPoints += 5;
        this.commentsCount++;
    }
    
    public void addPointsForTrip() {
        this.totalPoints += 25;
        this.weeklyPoints += 25;
        this.monthlyPoints += 25;
        this.yearlyPoints += 25;
        this.tripsCount++;
    }
    
    public void addPointsForIncidentReport() {
        this.totalPoints += 15;
        this.weeklyPoints += 15;
        this.monthlyPoints += 15;
        this.yearlyPoints += 15;
        this.incidentsReportedCount++;
    }
    
    public void addHelpfulVote() {
        this.totalPoints += 2;
        this.weeklyPoints += 2;
        this.monthlyPoints += 2;
        this.yearlyPoints += 2;
        this.helpfulVotesReceived++;
    }
}
