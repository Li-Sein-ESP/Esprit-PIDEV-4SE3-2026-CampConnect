package com.campconnect.analytics;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "campsite_audit")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CampsiteAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String campsiteId; // Reference to MongoDB ID
    private String campsiteName;
    private String region;
    private LocalDateTime auditDate;

    @OneToMany(mappedBy = "campsiteAudit", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PricingTrend> trends = new ArrayList<>();

    public void addTrend(PricingTrend trend) {
        trends.add(trend);
        trend.setCampsiteAudit(this);
    }
}
