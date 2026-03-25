package com.campconnect.controller;

import com.campconnect.dto.EventDTO;
import com.campconnect.service.IEventServices;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventsController {

    @Autowired
    private IEventServices eventService;

    @GetMapping
    public List<EventDTO> getAllEvents() {
        return eventService.getAllEvents();
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventDTO> getEventById(@PathVariable String id) {
        EventDTO event = eventService.getEventById(id);
        return event != null ? ResponseEntity.ok(event) : ResponseEntity.notFound().build();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ORGANIZER')")
    public ResponseEntity<EventDTO> createEvent(@Valid @RequestBody EventDTO eventDTO) {
        return ResponseEntity.ok(eventService.createEvent(eventDTO));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ORGANIZER')")
    public ResponseEntity<EventDTO> updateEvent(@PathVariable String id, @Valid @RequestBody EventDTO eventDTO) {
        EventDTO updated = eventService.updateEvent(id, eventDTO);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteEvent(@PathVariable String id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/register")
    public ResponseEntity<com.campconnect.dto.EventRegistrationDTO> registerForEvent(
            @PathVariable String id,
            @Valid @RequestBody com.campconnect.dto.EventRegistrationDTO registrationDTO) {
        return ResponseEntity.ok(eventService.registerUser(id, registrationDTO.getUserId(), registrationDTO.getParticipants()));
    }

    @GetMapping("/{id}/participants")
    public ResponseEntity<List<com.campconnect.dto.EventRegistrationDTO>> getParticipants(@PathVariable String id) {
        return ResponseEntity.ok(eventService.getEventParticipants(id));
    }
}
