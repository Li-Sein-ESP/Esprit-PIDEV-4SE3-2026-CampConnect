package com.campconnect.entity;

import com.campconnect.model.User;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.campconnect.enums.ReservationStatus;
import java.time.LocalDateTime;

@Document(collection = "reservations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Reservation {
    @Id
    private String id;
    private ReservationStatus status;
    private double totalPrice;
    private LocalDateTime reservationDate;

    @DBRef
    private User user;

    @DBRef
    private Trip trip;
}
