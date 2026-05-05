package com.campconnect.controller;
 
import com.campconnect.dto.ReservationDto;
import com.campconnect.model.Campsite;
import com.campconnect.model.Reservation;
import com.campconnect.model.User;
import com.campconnect.repository.CampsiteRepository;
import com.campconnect.repository.UserRepository;
import com.campconnect.service.PdfService;
import com.campconnect.service.ReservationServiceImpl;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
 
import java.util.List;
 
@CrossOrigin(origins = "http://localhost:4200", maxAge = 3600)
@RestController
@RequestMapping("/api/reservations")
public class ReservationController {
 
    private final ReservationServiceImpl reservationService;
    private final PdfService pdfService;
    private final UserRepository userRepository;
    private final CampsiteRepository campsiteRepository;
 
    public ReservationController(ReservationServiceImpl reservationService, PdfService pdfService, 
                                 UserRepository userRepository, CampsiteRepository campsiteRepository) {
        this.reservationService = reservationService;
        this.pdfService = pdfService;
        this.userRepository = userRepository;
        this.campsiteRepository = campsiteRepository;
    }
 
    @PostMapping
    public ResponseEntity<?> createReservation(@Valid @RequestBody ReservationDto reservationDTO) {
        try {
            System.out.println("[ReservationController] Creating reservation: userId=" + reservationDTO.getUserId()
                + ", targetId=" + reservationDTO.getTargetId()
                + ", startDate=" + reservationDTO.getStartDate()
                + ", endDate=" + reservationDTO.getEndDate());

            Reservation reservation = new Reservation();
            reservation.setUserId(reservationDTO.getUserId());
            reservation.setUsername(reservationDTO.getUsername());
            reservation.setTargetId(reservationDTO.getTargetId());
            reservation.setStartDate(reservationDTO.getStartDate());
            reservation.setEndDate(reservationDTO.getEndDate());

            Reservation createdReservation = reservationService.createReservation(reservation);
            System.out.println("[ReservationController] Reservation created: id=" + createdReservation.getId());
            return new ResponseEntity<>(createdReservation, HttpStatus.CREATED);

        } catch (IllegalArgumentException | IllegalStateException e) {
            System.err.println("[ReservationController] Business error: " + e.getMessage());
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.err.println("[ReservationController] Unexpected error: " + e.getClass().getName() + " - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("error", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
 
    @GetMapping
    public ResponseEntity<List<Reservation>> getAllReservations() {
        List<Reservation> reservations = reservationService.getAllReservations();
        return ResponseEntity.ok(reservations);
    }
 
    @GetMapping("/{id}")
    public ResponseEntity<Reservation> getReservationById(@PathVariable("id") String id) {
        Reservation reservation = reservationService.getReservationById(id);
        return ResponseEntity.ok(reservation);
    }
 
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Reservation>> getUserReservations(@PathVariable("userId") String userId) {
        List<Reservation> reservations = reservationService.getUserReservations(userId);
        return ResponseEntity.ok(reservations);
    }
 
    @GetMapping("/{id}/ticket/pdf")
    public ResponseEntity<byte[]> downloadTicket(@PathVariable String id) {
        Reservation reservation = reservationService.getReservationById(id);
        User user = userRepository.findById(reservation.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Campsite campsite = campsiteRepository.findById(reservation.getTargetId())
                .orElseThrow(() -> new RuntimeException("Campsite not found"));
 
        byte[] pdfContent = pdfService.generateReservationTicket(reservation, user.getUsername(), campsite.getName());
 
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "ticket-" + id + ".pdf");
 
        return new ResponseEntity<>(pdfContent, headers, HttpStatus.OK);
    }
 
    @PutMapping("/{id}")
    public ResponseEntity<Reservation> updateReservation(
            @PathVariable("id") String id,
            @Valid @RequestBody ReservationDto reservationDTO) {
        Reservation reservation = new Reservation();
        reservation.setUserId(reservationDTO.getUserId());
        reservation.setTargetId(reservationDTO.getTargetId());
        reservation.setStartDate(reservationDTO.getStartDate());
        reservation.setEndDate(reservationDTO.getEndDate());
        Reservation updatedReservation = reservationService.updateReservation(id, reservation);
        return ResponseEntity.ok(updatedReservation);
    }
 
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Reservation> cancelReservation(@PathVariable("id") String id) {
        Reservation cancelledReservation = reservationService.cancelReservation(id);
        return ResponseEntity.ok(cancelledReservation);
    }
 
    @PatchMapping("/{id}/confirm")
    public ResponseEntity<Reservation> confirmReservation(@PathVariable("id") String id) {
        Reservation confirmedReservation = reservationService.confirmReservation(id);
        return ResponseEntity.ok(confirmedReservation);
    }
 
    @DeleteMapping("/{id}")
    public ResponseEntity<Reservation> deleteReservation(@PathVariable("id") String id) {
        Reservation cancelledReservation = reservationService.cancelReservation(id);
        return ResponseEntity.ok(cancelledReservation);
    }
}
