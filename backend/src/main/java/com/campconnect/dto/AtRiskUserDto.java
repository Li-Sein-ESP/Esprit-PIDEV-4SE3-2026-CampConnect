package com.campconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AtRiskUserDto {
    private String customerId;
    private Double churnScore;
    private String riskLevel;
    private String action;
    private String lastActionDate;
}
