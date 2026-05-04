package com.campconnect.enums;

public enum EventStatus {
    UPCOMING,
    ONGOING,
    COMPLETED,
    CANCELLED;

    @com.fasterxml.jackson.annotation.JsonCreator
    public static EventStatus fromString(String value) {
        if (value == null || value.isEmpty()) return null;
        try {
            return EventStatus.valueOf(value.toUpperCase().replace('-', '_'));
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
