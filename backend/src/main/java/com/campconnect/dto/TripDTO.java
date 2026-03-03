package com.campconnect.dto;

import com.campconnect.model.DifficultyLevel;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TripDTO {
    private String id;
    private String name;
    private String destination;
    private String notes;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private DifficultyLevel difficulty;
    private String groupId;
}
