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

import java.time.LocalDateTime;

@Document(collection = "gear_reviews")
@Data
@NoArgsConstructor
@CompoundIndexes({
        @CompoundIndex(name = "idx_review_gear", def = "{'gearId': 1, 'createdAt': -1}"),
        @CompoundIndex(name = "idx_review_reviewer", def = "{'reviewerId': 1}")
})
public class GearReview {

    @Id
    private String id;

    @Indexed
    private String gearId;

    @Indexed
    private String reviewerId;
    private String reviewerName; // Denormalized for display

    private int rating; // 1 to 5
    private String comment;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @CreatedBy
    private String createdBy;
}
