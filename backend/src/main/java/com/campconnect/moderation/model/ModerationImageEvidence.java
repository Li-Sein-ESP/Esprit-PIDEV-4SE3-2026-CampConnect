package com.campconnect.moderation.model;

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
public class ModerationImageEvidence {
    private String sourceUrl;
    private String resolvedPath;
    private double unsafeProbability;
    private double textRiskScore;
    private double combinedScore;
    private ModerationDecision decision;
    @Builder.Default
    private List<String> reasons = new ArrayList<>();
    private String modelName;
    private String rawOutput;
}
