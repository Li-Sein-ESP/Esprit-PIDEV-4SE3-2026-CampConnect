package com.campconnect.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "connection_requests")
public class ConnectionRequest {

    @Id
    private String id;

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

    private ConnectionRequestStatus status = ConnectionRequestStatus.PENDING;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

}
