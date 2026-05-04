package com.campconnect.delivery.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "delivery_batches")
@Data
@NoArgsConstructor
@CompoundIndexes({
    @CompoundIndex(name = "idx_batch_provider_status", def = "{'providerId': 1, 'status': 1}")
})
public class DeliveryBatch {
    @Id
    private String id;

    @Indexed
    private String providerId;

    private String vehicleId;
    private String zone;

    private List<String> deliveryIds = new ArrayList<>();

    private double totalCapacityUsed;

    @Indexed
    private BatchStatus status = BatchStatus.COLLECTING;

    private LocalDateTime scheduledDispatch;

    @CreatedDate
    private LocalDateTime createdAt;
}
