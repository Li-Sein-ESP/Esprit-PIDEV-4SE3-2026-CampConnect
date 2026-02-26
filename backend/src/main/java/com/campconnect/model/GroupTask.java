package com.campconnect.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "group_tasks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupTask {
    @Id
    private String id;

    private String groupId;

    private String tripId;

    private String title;

    private String assignedToUserId;

    private GroupTaskStatus status;

    private LocalDateTime dueDate;

    @CreatedDate
    private LocalDateTime createdAt;
}
