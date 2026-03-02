package com.campconnect.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PostDTO {
    private String id;
    private String content;
    private String threadId;
    private String authorId;
    private LocalDateTime createdAt;
}
