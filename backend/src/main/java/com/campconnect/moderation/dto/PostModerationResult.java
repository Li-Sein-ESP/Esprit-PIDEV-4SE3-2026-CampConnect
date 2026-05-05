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
public class PostModerationResult {
    private ModerationDecision decision;
    private double maxCombinedScore;
    private double avgCombinedScore;
    @Builder.Default
    private List<String> reasons = new ArrayList<>();
    @Builder.Default
    private List<ImageModerationPrediction> predictions = new ArrayList<>();
}
