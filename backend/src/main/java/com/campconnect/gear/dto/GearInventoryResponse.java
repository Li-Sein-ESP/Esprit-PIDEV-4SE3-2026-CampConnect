package com.campconnect.gear.dto;

import lombok.Data;

@Data
public class GearInventoryResponse {
    private String id;
    private String gearId;
    private String gearName;
    private String warehouseId;
    private String warehouseName;
    private int quantity;
}
