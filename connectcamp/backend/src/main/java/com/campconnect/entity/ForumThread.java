package com.campconnect.entity;

import com.campconnect.model.User;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.campconnect.enums.ForumStatus;
import java.time.LocalDateTime;

@Document(collection = "forum_threads")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ForumThread {
    @Id
    private String id;
    private String title;
    private ForumStatus status; // OPEN, CLOSED
    private LocalDateTime createdAt;

    @DBRef
    private User creator;
}
