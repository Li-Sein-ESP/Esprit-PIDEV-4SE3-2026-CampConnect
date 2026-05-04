package com.campconnect.service;

import com.campconnect.dto.TripDTO;
import com.campconnect.entity.Trip;
import com.campconnect.entity.Category;
import com.campconnect.enums.TripStatus;
import com.campconnect.repository.TripRepository;
import com.campconnect.repository.CategoryRepository;
import com.campconnect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TripService {

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    public List<TripDTO> getAllTrips() {
        return tripRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public TripDTO createTrip(TripDTO tripDTO) {
        Trip trip = convertToEntity(tripDTO);
        trip.setStatus(TripStatus.DRAFT);
        return convertToDTO(tripRepository.save(trip));
    }

    private TripDTO convertToDTO(Trip trip) {
        TripDTO dto = new TripDTO();
        dto.setId(trip.getId());
        dto.setDestination(trip.getDestination());
        dto.setCategoryName(trip.getCategory() != null ? trip.getCategory().getName() : null);
        dto.setDifficulty(trip.getDifficulty());
        dto.setStatus(trip.getStatus());
        dto.setStartDate(trip.getStartDate());
        dto.setEndDate(trip.getEndDate());
        
        if (trip.getCreator() != null) {
            dto.setCreatorId(trip.getCreator().getId());
        }
        return dto;
    }

    private Trip convertToEntity(TripDTO dto) {
        Trip trip = new Trip();
        trip.setDestination(dto.getDestination());
        
        // Handle Category
        if (dto.getCategoryName() != null) {
            Category category = categoryRepository.findByName(dto.getCategoryName())
                .orElseGet(() -> categoryRepository.save(new Category(dto.getCategoryName(), "")));
            trip.setCategory(category);
        }
        
        trip.setDifficulty(dto.getDifficulty());
        trip.setStartDate(dto.getStartDate());
        trip.setEndDate(dto.getEndDate());
        
        // Handle Traceability: assign creator
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            String username = ((UserDetails)principal).getUsername();
            userRepository.findByUsername(username).ifPresent(trip::setCreator);
        }
        
        return trip;
    }
}
