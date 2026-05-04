package com.campconnect.gear.dto;

import com.campconnect.gear.model.GearStatus;
import com.campconnect.gear.model.ListingType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Schema(description = "Gear item response")
public class GearResponse {
    private String id;
    private String name;
    private String description;
    private BigDecimal price;
    private BigDecimal dailyPrice;
    private BigDecimal salePrice;
    private ListingType listingType;
    private int quantity;
    private String condition;
    private Double averageRating;
    private int reviewCount;
    private GearStatus status;
    private String category;
    private String ownerId;
    private String ownerName;
    private Double warehouseLat;
    private Double warehouseLng;
    private double weightKg;
    private List<GearImageDto> images;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
