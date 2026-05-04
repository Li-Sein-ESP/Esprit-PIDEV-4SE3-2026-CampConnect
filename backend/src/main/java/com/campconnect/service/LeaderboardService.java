package com.campconnect.service;

import com.campconnect.dto.LeaderboardResponseDTO;

public interface LeaderboardService {
    LeaderboardResponseDTO getLeaderboard(String period, String currentUserId);
}
