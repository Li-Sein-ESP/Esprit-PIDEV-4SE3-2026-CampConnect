package com.campconnect.service;

import com.campconnect.model.Reservation;

import java.util.List;

public interface IReservationService {

    // CREATE
    Reservation createReservation(Reservation reservation);

    // READ
    List<Reservation> getAllReservations();

    List<Reservation> getUserReservations(String userId);

    Reservation getReservationById(String id);

    // UPDATE
    Reservation updateReservation(String id, Reservation updatedReservation);

    // CANCEL
    Reservation cancelReservation(String id);
}