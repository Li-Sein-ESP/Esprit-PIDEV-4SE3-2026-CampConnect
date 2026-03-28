package com.campconnect.enums;

public enum DifficultyLevel {
    BEGINNER,
    INTERMEDIATE,
    ADVANCED,
    MODERATE,
    ALL_LEVELS;

    @com.fasterxml.jackson.annotation.JsonCreator
    public static DifficultyLevel fromString(String value) {
        if (value == null || value.isEmpty()) return null;
        try {
            return DifficultyLevel.valueOf(value.toUpperCase().replace('-', '_'));
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
