package com.campconnect.enums;

public enum CertificationStatus {
    ACTIVE,
    EXPIRED,
    REVOKED;
    
    @com.fasterxml.jackson.annotation.JsonCreator
    public static CertificationStatus fromString(String value) {
        if (value == null || value.isEmpty()) return null;
        try {
            return CertificationStatus.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
