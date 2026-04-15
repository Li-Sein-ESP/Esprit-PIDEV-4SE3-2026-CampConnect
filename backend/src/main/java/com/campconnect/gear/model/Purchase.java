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

@Document(collection = "purchases")
@Data
@NoArgsConstructor
@CompoundIndexes({
        @CompoundIndex(name = "idx_purchase_gear", def = "{'gearId': 1}"),
        @CompoundIndex(name = "idx_purchase_buyer", def = "{'buyerId': 1, 'status': 1}")
})
public class Purchase {

    @Id
    private String id;

    @Indexed
    private String gearId;
    private String gearName; // Denormalized

    @Indexed
    private String buyerId;
    private String buyerName; // Denormalized

    private int quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;

    @Indexed
    private PurchaseStatus status = PurchaseStatus.PENDING;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @CreatedBy
    private String createdBy;
}
