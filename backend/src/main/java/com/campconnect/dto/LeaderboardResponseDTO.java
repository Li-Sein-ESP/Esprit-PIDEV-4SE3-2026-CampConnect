package com.campconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardResponseDTO {

    private String period;
    private List<LeaderboardEntryDTO> entries = new ArrayList<>();
    private Integer activeCampers;
    private Integer totalBadges;
    private Integer totalTrips;
    private Integer avgTrustScore;
}
