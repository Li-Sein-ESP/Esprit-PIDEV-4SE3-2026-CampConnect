package com.campconnect.service;

import com.campconnect.dto.EventDTO;
import java.util.List;

public interface IEventServices {
    List<EventDTO> getAllEvents();
    EventDTO getEventById(String id);
    EventDTO createEvent(EventDTO dto);
    EventDTO updateEvent(String id, EventDTO dto);
    void deleteEvent(String id);
    
    com.campconnect.dto.EventRegistrationDTO registerUser(String eventId, String userId, int participants);
    List<com.campconnect.dto.EventRegistrationDTO> getEventParticipants(String eventId);
}
