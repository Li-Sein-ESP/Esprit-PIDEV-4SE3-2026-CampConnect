package com.campconnect.controller;

import com.campconnect.dto.LeaderboardResponseDTO;
import com.campconnect.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/leaderboard")
@RequiredArgsConstructor
@CrossOrigin(originPatterns = "*")
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    @GetMapping
    public ResponseEntity<LeaderboardResponseDTO> getLeaderboard(
            @RequestParam(defaultValue = "month") String period,
            @RequestParam(required = false) String currentUserId
    ) {
        return ResponseEntity.ok(leaderboardService.getLeaderboard(period, currentUserId));
    }
}
