package com.campconnect.controller;

import com.campconnect.dto.ChangePasswordRequest;
import com.campconnect.dto.MessageResponse;
import com.campconnect.dto.UpdateProfileRequest;
import com.campconnect.dto.UserProfileResponse;
import com.campconnect.dto.UserStatsResponse;
import com.campconnect.service.UserService;
import com.campconnect.service.UserDetailsImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User profile management")
@PreAuthorize("isAuthenticated()")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<UserProfileResponse> getMe(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(userService.getProfile(resolveUserId(userDetails)));
    }

    @PutMapping("/me")
    @Operation(summary = "Update current user profile")
    public ResponseEntity<UserProfileResponse> updateMe(
            @Valid @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(userService.updateProfile(resolveUserId(userDetails), request));
    }

    @PutMapping("/me/password")
    @Operation(summary = "Change current user password")
    public ResponseEntity<MessageResponse> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        userService.changePassword(resolveUserId(userDetails), request);
        return ResponseEntity.ok(new MessageResponse("Password updated successfully"));
    }

    @GetMapping("/me/stats")
    @Operation(summary = "Get current user statistics")
    public ResponseEntity<UserStatsResponse> getMyStats(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(userService.getUserStats(resolveUserId(userDetails)));
    }

    private String resolveUserId(UserDetailsImpl userDetails) {
        if (userDetails != null) {
            return userDetails.getId();
        }
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl principal) {
            return principal.getId();
        }
        throw new IllegalStateException("Authenticated user not found");
    }
}
