package com.campconnect.enums;

public enum EventType {
    WORKSHOP,
    EXPEDITION,
    TRAINING,
    COMMUNITY_MEETUP,
    GUIDED_HIKE,
    RETREAT,
    CERTIFICATION,
    GROUP_CAMP,
    SKILLS_COURSE,
    FESTIVAL,
    MEETUP;

    @com.fasterxml.jackson.annotation.JsonCreator
    public static EventType fromString(String value) {
        if (value == null || value.isEmpty()) return null;
        try {
            return EventType.valueOf(value.toUpperCase().replace('-', '_'));
        } catch (IllegalArgumentException e) {
            return null; 
        }
    }
}
