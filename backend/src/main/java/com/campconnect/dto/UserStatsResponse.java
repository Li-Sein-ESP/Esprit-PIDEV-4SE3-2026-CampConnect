package com.campconnect.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "User activity statistics for the camper dashboard")
public class UserStatsResponse {
    @Schema(description = "Total number of trips completed by the user", example = "47")
    private Long tripsCompleted;
    
    @Schema(description = "Number of unique campsites the user has visited", example = "32")
    private Long campsitesVisited;
    
    @Schema(description = "Number of reviews written by the user", example = "28")
    private Long reviewsGiven;
    
    @Schema(description = "Total number of gear items rented by the user", example = "15")
    private Long gearRented;
    
    @Schema(description = "Total number of gear items purchased by the user", example = "8")
    private Long gearPurchased;
    
    @Schema(description = "Number of currently active reservations", example = "2")
    private Long activeReservations;
    
    @Schema(description = "Number of currently active gear rentals", example = "1")
    private Long activeRentals;
}
