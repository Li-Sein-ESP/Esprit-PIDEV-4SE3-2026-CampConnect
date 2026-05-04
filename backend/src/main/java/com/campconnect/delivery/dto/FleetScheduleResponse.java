package com.campconnect.delivery.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Provider fleet schedule view — one entry per vehicle, with a day-by-day usage breakdown.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FleetScheduleResponse {

    private String vehicleId;
    private String plateNumber;
    private String vehicleType;
    private double maxCapacityKg;
    private String status;
    private List<DaySlot> days;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DaySlot {
        /** ISO date string, e.g. "2026-06-09" */
        private String date;
        private int orderCount;
        private double usedCapacityKg;
        /** (usedCapacityKg / maxCapacityKg) * 100 — clamped to [0, 100] */
        private double capacityPercent;
        private List<String> zonesServed;
        private List<String> deliveryIds;
    }
}
