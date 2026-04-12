package com.campconnect.dto;

/**
 * DTO used to transfer certification statistics data from the backend to the frontend.
 *
 * This DTO is populated by a MongoDB Aggregation Pipeline that crosses
 * the 'user_certifications' collection with the 'certifications' collection,
 * equivalent to a SQL JOIN with GROUP BY aggregation.
 *
 * Fields:
 * - certificationName: the name of the certification program
 * - totalIssued: total number of certifications delivered for this program
 * - activeCount: number of certifications still ACTIVE (valid)
 * - expiredCount: number of certifications marked as EXPIRED by the scheduler
 */
public class CertificationStatsDTO {

    private String certificationId;
    private String certificationName;
    private long totalIssued;
    private long activeCount;
    private long expiredCount;

    // Default constructor required for deserialization
    public CertificationStatsDTO() {}

    public CertificationStatsDTO(String certificationId, String certificationName,
                                  long totalIssued, long activeCount, long expiredCount) {
        this.certificationId = certificationId;
        this.certificationName = certificationName;
        this.totalIssued = totalIssued;
        this.activeCount = activeCount;
        this.expiredCount = expiredCount;
    }

    // ─── Getters & Setters ───

    public String getCertificationId() { return certificationId; }
    public void setCertificationId(String certificationId) { this.certificationId = certificationId; }

    public String getCertificationName() { return certificationName; }
    public void setCertificationName(String certificationName) { this.certificationName = certificationName; }

    public long getTotalIssued() { return totalIssued; }
    public void setTotalIssued(long totalIssued) { this.totalIssued = totalIssued; }

    public long getActiveCount() { return activeCount; }
    public void setActiveCount(long activeCount) { this.activeCount = activeCount; }

    public long getExpiredCount() { return expiredCount; }
    public void setExpiredCount(long expiredCount) { this.expiredCount = expiredCount; }
}
