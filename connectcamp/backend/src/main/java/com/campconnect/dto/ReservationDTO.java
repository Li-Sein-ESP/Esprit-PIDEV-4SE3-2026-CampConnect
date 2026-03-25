package com.campconnect.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.campconnect.enums.ReservationStatus;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservationDTO {
    private String id;
    private ReservationStatus status;
    private double totalPrice;
    private LocalDateTime reservationDate;
    private String userId;
    private String username;
    private String tripId;
    private String tripDestination;
}
