package com.campconnect.gear.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO returned by GET /api/gear/{gearId}/booked-dates.
 * Represents a single booked date range for a gear item.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookedDateRange {

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate start;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate end;
}
