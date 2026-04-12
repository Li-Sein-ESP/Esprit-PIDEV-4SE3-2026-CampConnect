package com.campconnect.gear.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "maintenance_records")
@Data
@NoArgsConstructor
public class MaintenanceRecord {

    @Id
    private String id;

    @Indexed
    private String gearId;

    private String description;

    private LocalDate maintenanceDate;

    @Indexed
    private MaintenanceStatus status = MaintenanceStatus.SCHEDULED;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @CreatedBy
    private String createdBy;

    private boolean deleted = false;
}
