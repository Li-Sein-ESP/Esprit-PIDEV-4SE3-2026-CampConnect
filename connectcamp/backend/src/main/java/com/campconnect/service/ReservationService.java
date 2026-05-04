package com.campconnect.service;

import com.campconnect.dto.ReservationDTO;
import com.campconnect.entity.Reservation;
import com.campconnect.enums.ReservationStatus;
import com.campconnect.repository.ReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReservationService {

    @Autowired
    private ReservationRepository reservationRepository;

    public List<ReservationDTO> getReservationsByUser(String userId) {
        return reservationRepository.findByUserId(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ReservationDTO createReservation(ReservationDTO reservationDTO) {
        Reservation reservation = new Reservation();
        reservation.setStatus(ReservationStatus.PENDING);
        reservation.setTotalPrice(reservationDTO.getTotalPrice());
        reservation.setReservationDate(LocalDateTime.now());
        return convertToDTO(reservationRepository.save(reservation));
    }

    private ReservationDTO convertToDTO(Reservation res) {
        return new ReservationDTO(res.getId(), res.getStatus(), res.getTotalPrice(), 
            res.getReservationDate(), null, null, null, null);
    }
}
