package com.campconnect.moderation.model;

import com.campconnect.moderation.ModerationDecision;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "post_moderation_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostModerationRecord {

    @Id
    private String id;

    private String postId;
    private String authorId;
    private String authorName;
    private String content;
    private List<String> imageUrls;
    private ModerationDecision decision;
    private String status;
    private double maxCombinedScore;
    private double avgCombinedScore;
    @Builder.Default
    private List<String> reasons = new ArrayList<>();
    @Builder.Default
    private List<ModerationImageEvidence> evidence = new ArrayList<>();
    private String adminDecision;
    private String adminNote;
    private String reviewedBy;
    private LocalDateTime reviewedAt;
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt;
}
