package com.campconnect.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Schema(description = "User profile response")
public class UserProfileResponse {
    private String id;
    private String username;
    private String email;
    private String name;
    private List<String> roles;
    private Map<String, Object> profileDetails;
    private LocalDateTime createdAt;
}
