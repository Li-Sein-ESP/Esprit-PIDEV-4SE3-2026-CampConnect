package com.campconnect.service;

import com.campconnect.model.Reservation;
import com.campconnect.model.ReservationStatus;
import com.campconnect.repository.ReservationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReservationServiceImplTest {

    @Mock
    private ReservationRepository reservationRepository;

    @InjectMocks
    private ReservationServiceImpl reservationService;

    private Reservation validReservation;

    @BeforeEach
    void setUp() {
        validReservation = new Reservation();
        validReservation.setId("res-1");
        validReservation.setUserId("user-1");
        validReservation.setTargetId("site-1");
        validReservation.setStartDate(LocalDateTime.now().plusDays(1));
        validReservation.setEndDate(LocalDateTime.now().plusDays(3));
        validReservation.setStatus(ReservationStatus.PENDING);
    }

    @Test
    void createReservation_ShouldSave_WhenValid() {
        // Arrange
        when(reservationRepository.findByTargetId(anyString())).thenReturn(Collections.emptyList());
        when(reservationRepository.save(any(Reservation.class))).thenReturn(validReservation);

        // Act
        Reservation result = reservationService.createReservation(validReservation);

        // Assert
        assertNotNull(result);
        assertEquals(ReservationStatus.PENDING, result.getStatus());
        verify(reservationRepository, times(1)).save(any(Reservation.class));
    }

    @Test
    void createReservation_ShouldThrow_WhenEndDateBeforeStart() {
        // Arrange
        validReservation.setEndDate(validReservation.getStartDate().minusDays(1));

        // Act & Assert
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            reservationService.createReservation(validReservation);
        });

        assertEquals("End date must be after start date", exception.getMessage());
        verify(reservationRepository, never()).save(any());
    }

    @Test
    void createReservation_ShouldThrow_WhenStartDateInPast() {
        // Arrange
        validReservation.setStartDate(LocalDateTime.now().minusDays(1));

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            reservationService.createReservation(validReservation);
        });
    }

    @Test
    void createReservation_ShouldThrow_WhenConflictExists() {
        // Arrange
        Reservation existing = new Reservation();
        existing.setStartDate(validReservation.getStartDate());
        existing.setEndDate(validReservation.getEndDate());
        existing.setStatus(ReservationStatus.CONFIRMED);

        when(reservationRepository.findByTargetId(anyString())).thenReturn(Collections.singletonList(existing));

        // Act & Assert
        Exception exception = assertThrows(IllegalStateException.class, () -> {
            reservationService.createReservation(validReservation);
        });

        assertTrue(exception.getMessage().contains("conflict"));
    }

    @Test
    void getReservationById_ShouldReturn_WhenExists() {
        // Arrange
        when(reservationRepository.findById("res-1")).thenReturn(Optional.of(validReservation));

        // Act
        Reservation result = reservationService.getReservationById("res-1");

        // Assert
        assertEquals("res-1", result.getId());
    }

    @Test
    void getReservationById_ShouldThrow_WhenNotFound() {
        // Arrange
        when(reservationRepository.findById("unknown")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            reservationService.getReservationById("unknown");
        });
    }

    @Test
    void deleteReservation_ShouldCancel_InsteadOfDelete() {
        // Arrange
        when(reservationRepository.findById("res-1")).thenReturn(Optional.of(validReservation));
        when(reservationRepository.save(any(Reservation.class))).thenReturn(validReservation);

        // Act
        reservationService.deleteReservation("res-1");

        // Assert
        assertEquals(ReservationStatus.CANCELLED, validReservation.getStatus());
        verify(reservationRepository, times(1)).save(any(Reservation.class));
        verify(reservationRepository, never()).deleteById(anyString());
    }
}
