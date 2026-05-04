package com.campconnect.analytics;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "pricing_trend")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PricingTrend {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String factorName; // e.g., "Occupancy", "Weather"
    private Double multiplier;
    private Double impactAmount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campsite_audit_id")
    @JsonIgnore
    private CampsiteAudit campsiteAudit;
}
