package com.campconnect.controller;

import com.campconnect.dto.MatchRequest;
import com.campconnect.service.MatchingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/matching")
@CrossOrigin(origins = "http://localhost:4200", maxAge = 3600)
@lombok.RequiredArgsConstructor
public class MatchingController {

    private final MatchingService matchingService;

    @PostMapping("/score")
    public Double matchProfiles(@RequestBody MatchRequest request) {

        return matchingService.getCompatibilityScore(
                request.getProfile1(),
                request.getProfile2()
        );
    }
}