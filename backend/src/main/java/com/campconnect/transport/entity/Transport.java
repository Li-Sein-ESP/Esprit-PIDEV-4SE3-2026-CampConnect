package com.campconnect.transport.entity;

import java.math.BigDecimal;
import java.util.UUID;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.campconnect.transport.enums.TransportMode;
import com.campconnect.transport.enums.TransportStatus;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Document(collection = "transports")
public class Transport {
    @Id
    private String id;
    private String tripId;
    private String routeSegmentId; // Link to the trip segment
    private TransportMode mode;
    private BigDecimal cost;
    private int duration;
    private String provider;
    private String imageUrl;
    private java.time.Instant departureTime; // New field for notifications
    private TransportStatus status = TransportStatus.AVAILABLE;
    private int delayMinutes; // New field for smart reschedule
    // Rating summary fields (computed from transport reviews)
    private Double averageRating;
    private Integer reviewCount;

    public Transport(String tripId, String routeSegmentId, TransportMode mode, BigDecimal cost, int duration, String provider) {
        this.id = UUID.randomUUID().toString();
        this.tripId = tripId;
        this.routeSegmentId = routeSegmentId;
        this.mode = mode;
        this.cost = cost;
        this.duration = duration;
        this.provider = provider;
    }

    public Transport(String tripId, String routeSegmentId, TransportMode mode, BigDecimal cost, int duration, String provider, String imageUrl) {
        this(tripId, routeSegmentId, mode, cost, duration, provider);
        this.imageUrl = imageUrl;
    }
}
