package com.campconnect.service;

import com.campconnect.model.User;

import com.campconnect.dto.EventDTO;
import com.campconnect.entity.Event;
import com.campconnect.repository.EventRepository;
import com.campconnect.repository.CategoryRepository;
import com.campconnect.repository.UserRepository;
import com.campconnect.entity.Category;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import com.campconnect.dto.EventRegistrationDTO;
import com.campconnect.entity.EventRegistration;
import com.campconnect.repository.EventRegistrationRepository;

@Service
public class EventServicesImpl implements IEventServices {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRegistrationRepository eventRegistrationRepository;

    @Override
    public List<EventDTO> getAllEvents() {
        return eventRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public EventDTO getEventById(String id) {
        return eventRepository.findById(id)
                .map(this::convertToDTO)
                .orElse(null);
    }

    @Override
    public EventDTO createEvent(EventDTO dto) {
        Event event = convertToEntity(dto);
        return convertToDTO(eventRepository.save(event));
    }

    @Override
    public EventDTO updateEvent(String id, EventDTO dto) {
        if (!eventRepository.existsById(id)) return null;
        Event event = convertToEntity(dto);
        event.setId(id);
        return convertToDTO(eventRepository.save(event));
    }

    @Override
    public void deleteEvent(String id) {
        eventRepository.deleteById(id);
    }

    @Override
    public EventRegistrationDTO registerUser(String eventId, String userId, int participants) {
        Event event = eventRepository.findById(eventId).orElse(null);
        User user = userRepository.findById(userId).orElse(null);
        
        if (event == null || user == null) return null;
        
        EventRegistration registration = new EventRegistration();
        registration.setEvent(event);
        registration.setUser(user);
        registration.setRegistrationDate(LocalDateTime.now());
        registration.setStatus("CONFIRMED");
        registration.setParticipants(participants);
        
        // Update registered count in event
        event.setRegistered(event.getRegistered() + participants);
        eventRepository.save(event);
        
        return convertToRegistrationDTO(eventRegistrationRepository.save(registration));
    }

    @Override
    public List<EventRegistrationDTO> getEventParticipants(String eventId) {
        return eventRegistrationRepository.findByEventId(eventId).stream()
                .map(this::convertToRegistrationDTO)
                .collect(Collectors.toList());
    }

    private EventRegistrationDTO convertToRegistrationDTO(EventRegistration reg) {
        EventRegistrationDTO dto = new EventRegistrationDTO();
        dto.setId(reg.getId());
        if (reg.getEvent() != null) {
            dto.setEventId(reg.getEvent().getId());
            dto.setEventTitle(reg.getEvent().getTitle());
        }
        if (reg.getUser() != null) {
            dto.setUserId(reg.getUser().getId());
            dto.setUsername(reg.getUser().getUsername());
        }
        dto.setRegistrationDate(reg.getRegistrationDate());
        dto.setStatus(reg.getStatus());
        dto.setParticipants(reg.getParticipants());
        return dto;
    }

    private EventDTO convertToDTO(Event event) {
        EventDTO dto = new EventDTO();
        dto.setId(event.getId());
        dto.setTitle(event.getTitle());
        dto.setDescription(event.getDescription());
        dto.setCategoryName(event.getCategory() != null ? event.getCategory().getName() : null);
        dto.setType(com.campconnect.enums.EventType.fromString(event.getType()));
        dto.setLocation(event.getLocation());
        dto.setStartDate(event.getStartDate());
        dto.setEndDate(event.getEndDate());
        dto.setDuration(event.getDuration());
        dto.setCapacity(event.getCapacity());
        dto.setRegistered(event.getRegistered());
        dto.setPrice(event.getPrice());
        dto.setDifficulty(com.campconnect.enums.DifficultyLevel.fromString(event.getDifficulty()));
        dto.setTags(event.getTags());
        dto.setImageUrl(event.getImageUrl());
        dto.setStatus(com.campconnect.enums.EventStatus.fromString(event.getStatus()));
        dto.setWhatToExpect(event.getWhatToExpect());
        dto.setWhatToBring(event.getWhatToBring());
        dto.setWhatsIncluded(event.getWhatsIncluded());
        dto.setSafetyNotes(event.getSafetyNotes());
        dto.setCancellationPolicy(event.getCancellationPolicy());
        
        if (event.getCreator() != null) {
            dto.setCreatorId(event.getCreator().getId());
            dto.setCreatorName(event.getCreator().getName());
        }
        return dto;
    }

    private Event convertToEntity(EventDTO dto) {
        Event event = new Event();
        event.setTitle(dto.getTitle());
        event.setDescription(dto.getDescription());
        
        // Handle Category
        if (dto.getCategoryName() != null) {
            Category category = categoryRepository.findByName(dto.getCategoryName())
                .orElseGet(() -> categoryRepository.save(new Category(dto.getCategoryName(), "")));
            event.setCategory(category);
        }
        
        event.setType(dto.getType() != null ? dto.getType().name() : null);
        event.setLocation(dto.getLocation());
        event.setStartDate(dto.getStartDate());
        event.setEndDate(dto.getEndDate());
        event.setDuration(dto.getDuration());
        event.setCapacity(dto.getCapacity());
        event.setRegistered(dto.getRegistered());
        event.setPrice(dto.getPrice());
        event.setDifficulty(dto.getDifficulty() != null ? dto.getDifficulty().name() : null);
        event.setTags(dto.getTags());
        event.setImageUrl(dto.getImageUrl());
        event.setStatus(dto.getStatus() != null ? dto.getStatus().name() : null);
        event.setWhatToExpect(dto.getWhatToExpect());
        event.setWhatToBring(dto.getWhatToBring());
        event.setWhatsIncluded(dto.getWhatsIncluded());
        event.setSafetyNotes(dto.getSafetyNotes());
        event.setCancellationPolicy(dto.getCancellationPolicy());
        
        // Handle Traceability: assign creator safely
        org.springframework.security.core.Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof UserDetails) {
            String username = ((UserDetails)auth.getPrincipal()).getUsername();
            userRepository.findByUsername(username).ifPresent(event::setCreator);
        }
        
        return event;
    }
}
