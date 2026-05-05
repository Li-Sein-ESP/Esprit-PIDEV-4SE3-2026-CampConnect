package com.campconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TriggerActionsResponseDto {
    private Integer queued;
    private Integer skippedAntiSpam;
    private String runDate;
}
