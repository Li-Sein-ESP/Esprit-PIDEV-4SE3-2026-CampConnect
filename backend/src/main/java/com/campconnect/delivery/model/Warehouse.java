package com.campconnect.delivery.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "warehouses")
@Data
@NoArgsConstructor
public class Warehouse {
    @Id
    private String id;

    @Indexed
    private String providerId;

    private String name;
    private String address;
    private Double latitude;
    private Double longitude;

    /** Geographic zone label (e.g. "NORTH", "SOUTH", "CENTRE", "EAST", "WEST"). */
    private String zone;

    @CreatedDate
    private LocalDateTime createdAt;

    private boolean deleted = false;
}
