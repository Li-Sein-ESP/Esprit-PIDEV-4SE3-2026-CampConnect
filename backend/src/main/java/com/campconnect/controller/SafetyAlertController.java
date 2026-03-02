package com.campconnect.controller;

import com.campconnect.dto.SafetyAlertDTO;
import com.campconnect.service.SafetyAlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SafetyAlertController {

    private final SafetyAlertService alertService;

    @GetMapping
    public ResponseEntity<List<SafetyAlertDTO>> getAllAlerts() {
        return ResponseEntity.ok(alertService.getAllAlerts());
    }

    @PostMapping
    public ResponseEntity<SafetyAlertDTO> createAlert(@RequestBody SafetyAlertDTO alertDTO) {
        return ResponseEntity.ok(alertService.createAlert(alertDTO));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SafetyAlertDTO> getAlertById(@PathVariable String id) {
        return ResponseEntity.ok(alertService.getAlertById(id));
    }

    @GetMapping("/trip/{tripId}")
    public ResponseEntity<List<SafetyAlertDTO>> getAlertsByTripId(@PathVariable String tripId) {
        return ResponseEntity.ok(alertService.getAlertsByTripId(tripId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAlert(@PathVariable String id) {
        alertService.deleteAlert(id);
        return ResponseEntity.noContent().build();
    }
}
