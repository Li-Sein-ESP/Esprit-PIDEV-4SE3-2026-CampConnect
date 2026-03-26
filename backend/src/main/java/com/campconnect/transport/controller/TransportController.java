package com.campconnect.transport.controller;

import com.campconnect.transport.dto.TransportDTO;
import com.campconnect.transport.entity.Transport;
import com.campconnect.transport.service.ITransportService;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import java.util.List;

@RestController
@RequestMapping("/api/transports")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class TransportController {
    private final ITransportService service;

    @GetMapping
    public List<Transport> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Transport getById(@PathVariable("id") String id) {
        return service.findById(id);
    }

    @GetMapping("/trip/{tripId}")
    public List<Transport> getByTripId(@PathVariable("tripId") String tripId) {
        return service.findByTripId(tripId);
    }

    @PostMapping
    public Transport create(@jakarta.validation.Valid @RequestBody TransportDTO dto) {
        return service.save(dto);
    }

    @PutMapping("/{id}")
    public Transport update(@PathVariable("id") String id, @jakarta.validation.Valid @RequestBody TransportDTO dto) {
        return service.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable("id") String id) {
        service.delete(id);
    }

    @PostMapping("/{transportId}/assign-trip/{tripId}")
    public void assignTrip(@PathVariable("transportId") String transportId, @PathVariable("tripId") String tripId) {
        service.assignToTrip(transportId, tripId);
    }
}
