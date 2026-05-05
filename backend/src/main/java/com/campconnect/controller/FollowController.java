package com.campconnect.controller;

import com.campconnect.service.FollowService;
import com.campconnect.service.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/community/follow")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FollowController {

    private final FollowService followService;
    private final com.campconnect.repository.UserRepository userRepository;

    @PostMapping("/{followingId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> followUser(@PathVariable String followingId, Authentication authentication) {
        String currentUserId = getUserIdFromAuth(authentication);
        followService.follow(currentUserId, followingId);
        return ResponseEntity.ok(Map.of("message", "Successfully followed user"));
    }

    @DeleteMapping("/{followingId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> unfollowUser(@PathVariable String followingId, Authentication authentication) {
        String currentUserId = getUserIdFromAuth(authentication);
        followService.unfollow(currentUserId, followingId);
        return ResponseEntity.ok(Map.of("message", "Successfully unfollowed user"));
    }

    @GetMapping("/status/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getFollowStatus(@PathVariable String userId, Authentication authentication) {
        String currentUserId = getUserIdFromAuth(authentication);
        boolean isFollowing = followService.isFollowing(currentUserId, userId);
        return ResponseEntity.ok(Map.of("isFollowing", isFollowing));
    }

    @GetMapping("/counts/{userId}")
    public ResponseEntity<?> getFollowCounts(@PathVariable String userId) {
        return ResponseEntity.ok(Map.of(
            "followersCount", followService.getFollowersCount(userId),
            "followingCount", followService.getFollowingCount(userId)
        ));
    }

    private String getUserIdFromAuth(Authentication authentication) {
        if (authentication.getPrincipal() instanceof UserDetailsImpl u) {
            return u.getId();
        }
        String name = authentication.getName();
        return userRepository.findByUsernameOrEmail(name, name)
            .map(u -> u.getId())
            .orElse(name);
    }
}
