package com.campconnect.model.common;

import org.springframework.data.annotation.TypeAlias;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@TypeAlias("LocationPoint")
public class LocationPoint {
    private double latitude;
    private double longitude;
    private String address;
}
