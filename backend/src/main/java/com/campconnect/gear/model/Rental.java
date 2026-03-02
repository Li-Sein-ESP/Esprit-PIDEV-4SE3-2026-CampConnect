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

import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "rentals")
@Data
@NoArgsConstructor
@CompoundIndexes({
        @CompoundIndex(name = "idx_rental_gear_status", def = "{'gearId': 1, 'status': 1}"),
        @CompoundIndex(name = "idx_rental_renter_status", def = "{'renterId': 1, 'status': 1}")
})
public class Rental {

    @Id
    private String id;

    @Indexed
    private String gearId;
    private String gearName; // Denormalized for quick reads

    @Indexed
    private String renterId;
    private String renterName; // Denormalized

    @Indexed
    private LocalDate startDate;

    @Indexed
    private LocalDate endDate;

    @Indexed
    private RentalStatus status = RentalStatus.PENDING;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @CreatedBy
    private String createdBy;
}
