package com.campconnect.events.service;
import com.campconnect.events.dto.EventRegistrationDTO;

import com.campconnect.events.dto.EventDTO;
import java.util.List;

public interface IEventServices {
    List<EventDTO> getAllEvents();
    EventDTO getEventById(String id);
    EventDTO createEvent(EventDTO dto);
    EventDTO updateEvent(String id, EventDTO dto);
    void deleteEvent(String id);
    
    EventRegistrationDTO registerUser(String eventId, String userId, int participants);
    List<EventRegistrationDTO> getEventParticipants(String eventId);
}
