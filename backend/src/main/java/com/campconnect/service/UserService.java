package com.campconnect.service;

import com.campconnect.dto.ChangePasswordRequest;
import com.campconnect.dto.UpdateProfileRequest;
import com.campconnect.dto.UserProfileResponse;
import com.campconnect.exception.BadRequestException;
import com.campconnect.exception.ResourceNotFoundException;
import com.campconnect.model.User;
import com.campconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserProfileResponse getProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return toResponse(user);
    }

    public UserProfileResponse getProfileByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        return toResponse(user);
    }

    @Transactional
    public UserProfileResponse updateProfile(String userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (request.getName() != null) {
            user.setName(request.getName());
        }

        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new BadRequestException("Email already in use");
            }
            user.setEmail(request.getEmail());
        }

        if (request.getProfileDetails() != null) {
            if (user.getProfileDetails() == null) {
                user.setProfileDetails(new HashMap<>());
            }
            user.getProfileDetails().putAll(request.getProfileDetails());
        }

        return toResponse(userRepository.save(user));
    }

    @Transactional
    public void changePassword(String userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private UserProfileResponse toResponse(User user) {
        UserProfileResponse response = new UserProfileResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setName(user.getName());
        response.setRoles(user.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(Collectors.toList()));
        response.setProfileDetails(user.getProfileDetails());
        response.setCreatedAt(user.getCreatedAt());
        return response;
    }
}
