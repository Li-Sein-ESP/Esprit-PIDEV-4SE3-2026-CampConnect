package com.campconnect.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.util.Map;

@Data
@Schema(description = "Request body to update user profile")
public class UpdateProfileRequest {
    @Size(min = 2, max = 50, message = "Name must be between 2 and 50 characters")
    private String name;

    @Email(message = "Email must be valid")
    private String email;

    private Map<String, Object> profileDetails;
}
