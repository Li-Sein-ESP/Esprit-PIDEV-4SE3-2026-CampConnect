package com.campconnect.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "follows")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Follow {
    @Id
    private String id;
    private String followerId;  // L'utilisateur qui suit
    private String followingId; // L'utilisateur suivi

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
