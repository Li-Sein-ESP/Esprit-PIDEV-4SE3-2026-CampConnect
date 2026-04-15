package com.campconnect.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "group_messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupMessage {
    @Id
    private String id;

    private String groupId;

    private String senderUserId;

    private String content;

    @CreatedDate
    private LocalDateTime createdAt;
}
