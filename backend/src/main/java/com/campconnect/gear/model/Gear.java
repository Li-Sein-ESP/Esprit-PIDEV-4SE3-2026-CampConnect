package com.campconnect.gear.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.index.TextIndexed;
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

    @TextIndexed(weight = 2)
    private String name;

    @TextIndexed
    private String description;

    @Indexed
    private BigDecimal price;

    /** Price per day when listed for rent. */
    private BigDecimal dailyPrice;

    /** Price when listed for sale. */
    private BigDecimal salePrice;

    private int quantity;
    private String condition;

    private Double averageRating = 0.0;
    private int reviewCount = 0;

    @Indexed
    private GearStatus status = GearStatus.AVAILABLE;

    @Indexed
    private String category;

    /**
     * Whether this item is FOR_SALE, FOR_RENT, or BOTH. Defaults to FOR_RENT for
     * backward-compat.
     */
    @Indexed
    private ListingType listingType = ListingType.FOR_RENT;

    @Indexed
    private String ownerId;

    // Delivery routing origin
    private Double warehouseLat;
    private Double warehouseLng;

    // Embedded images — tightly coupled to gear lifecycle
    private List<GearImage> images = new ArrayList<>();

    @CreatedDate
    @Indexed
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @CreatedBy
    private String createdBy;

    /** Approximate weight in kg for vehicle capacity scoring. Defaults to 0 (ignored in scoring). */
    private double weightKg = 0.0;

    private boolean deleted = false;

    @Version
    private Long version;
}
