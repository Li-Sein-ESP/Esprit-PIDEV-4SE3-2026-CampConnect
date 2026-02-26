package com.campconnect.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConnectionRequestDto {

    @NotBlank(message = "Sender ID is required")
    private String fromUserId;

    @NotBlank(message = "Sender Name is required")
    private String fromUserName;

    private String fromUserAvatar;

    @NotBlank(message = "Receiver ID is required")
    private String toUserId;

    @NotBlank(message = "Receiver Name is required")
    private String toUserName;

    private String toUserAvatar;

    private String campingStyle;

    private String experienceLevel;

    @NotNull(message = "Match score is required")
    private Double matchScore;

    private String message;
}
