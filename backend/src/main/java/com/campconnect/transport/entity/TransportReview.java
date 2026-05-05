package com.campconnect.transport.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Document(collection = "transport_reviews")
public class TransportReview {
    @Id
    private String id;
    private String transportId;
    private String userId;
    private int rating; // 1..5
    private String comment;

    public TransportReview(String transportId, String userId, int rating, String comment) {
        this.transportId = transportId;
        this.userId = userId;
        this.rating = rating;
        this.comment = comment;
    }
}
