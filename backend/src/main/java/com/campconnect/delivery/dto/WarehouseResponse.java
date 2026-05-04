package com.campconnect.delivery.dto;

import lombok.Data;

@Data
public class WarehouseResponse {
    private String id;
    private String providerId;
    private String name;
    private String address;
    private Double latitude;
    private Double longitude;
    private String zone;
    private String createdAt;
}
