package com.campconnect.analytics;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AnalyticsRepository extends JpaRepository<CampsiteAudit, Long> {

    /**
     * Requirement: Develop a complex function using keywords (involving more than one table)
     * This query filters by campsite name (Audit table) and multiplier (Trend table).
     */
    List<CampsiteAudit> findByCampsiteNameContainingAndTrends_MultiplierGreaterThan(String name, Double minMultiplier);

    /**
     * Requirement: Develop a complex function using JPQL (with joins)
     * This query finds high-impact audits by joining Audit and Trend tables.
     */
    @Query("SELECT DISTINCT a FROM CampsiteAudit a " +
           "JOIN a.trends t " +
           "WHERE a.region = :region " +
           "AND t.multiplier > :threshold " +
           "ORDER BY a.auditDate DESC")
    List<CampsiteAudit> findHighImpactAuditsByRegion(@Param("region") String region, 
                                                    @Param("threshold") Double threshold);
}
