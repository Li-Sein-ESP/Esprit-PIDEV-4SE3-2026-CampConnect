package com.campconnect.moderation.dto;

import com.campconnect.moderation.ModerationDecision;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImageModerationPrediction {
    private String sourceUrl;
    private String resolvedPath;
    private double unsafeProbability;
    private double textRiskScore;
    private double combinedScore;
    private ModerationDecision decision;
    @Builder.Default
    private List<String> reasons = new ArrayList<>();
    private String modelName;
    private boolean success;
    private String rawOutput;
}
