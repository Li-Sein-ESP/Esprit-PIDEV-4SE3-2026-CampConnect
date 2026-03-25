package com.campconnect.enums;

public enum BadgeRarity {
    COMMON,
    RARE,
    EPIC,
    LEGENDARY;
    
    @com.fasterxml.jackson.annotation.JsonCreator
    public static BadgeRarity fromString(String value) {
        if (value == null || value.isEmpty()) return null;
        try {
            return BadgeRarity.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
