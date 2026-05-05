package com.campconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CampGuardKpiDto {
    private Integer high;
    private Integer medium;
    private Integer low;
    private Double recall;
    private Double precision;
    private Double reengagementRate;
    private Double churnBefore;
    private Double churnAfter;
}
