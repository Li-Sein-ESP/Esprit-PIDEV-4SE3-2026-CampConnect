package com.campconnect.gear.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "gear")
@Data
@NoArgsConstructor
@CompoundIndexes({
        @CompoundIndex(name = "idx_gear_status_category", def = "{'status': 1, 'category': 1}"),
        @CompoundIndex(name = "idx_gear_owner_status", def = "{'ownerId': 1, 'status': 1}")
})
public class Gear {

    @Id
    private String id;

    private String name;
    private String description;

    @Indexed
    private BigDecimal price;

    private int quantity;
    private String condition;

    @Indexed
    private GearStatus status = GearStatus.AVAILABLE;

    @Indexed
    private String category;

    @Indexed
    private String ownerId;

    // Embedded images — tightly coupled to gear lifecycle
    private List<GearImage> images = new ArrayList<>();

    @CreatedDate
    @Indexed
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @CreatedBy
    private String createdBy;

    private boolean deleted = false;
}
