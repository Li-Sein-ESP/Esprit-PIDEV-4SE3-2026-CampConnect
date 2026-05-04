package com.campconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OpenIncidentSummaryDTO {
    private String region;
    private String tripId;
    private String reporterId;
    private long openIncidentCount;
}
