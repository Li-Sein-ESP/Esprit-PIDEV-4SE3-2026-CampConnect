package com.campconnect.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.campconnect.enums.IncidentType;
import com.campconnect.enums.IncidentSeverity;
import java.time.LocalDateTime;

@Document(collection = "incidents")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Incident {
    @Id
    private String id;
    private IncidentType type;
    private IncidentSeverity severity;
    private String description;
    private LocalDateTime reportedAt;

    @DBRef
    private Trip trip;
}
