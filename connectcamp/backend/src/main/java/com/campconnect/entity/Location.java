package com.campconnect.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Location {
    private String name;
    private String address;
    private Coordinates coordinates;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Coordinates {
        private double lat;
        private double lng;
    }
}
