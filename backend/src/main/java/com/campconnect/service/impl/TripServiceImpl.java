package com.campconnect.service.impl;

import com.campconnect.dto.TripDTO;
import com.campconnect.model.Group;
import com.campconnect.model.Trip;
import com.campconnect.repository.GroupRepository;
import com.campconnect.repository.TripRepository;
import com.campconnect.service.TripService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TripServiceImpl implements TripService {

    private final TripRepository tripRepository;
    private final GroupRepository groupRepository;

    @Override
    public TripDTO createTrip(TripDTO tripDTO) {
        Trip trip = new Trip();
        trip.setName(tripDTO.getName());
        trip.setDestination(tripDTO.getDestination());
        trip.setNotes(tripDTO.getNotes());
        trip.setStartDate(tripDTO.getStartDate());
        trip.setEndDate(tripDTO.getEndDate());
        trip.setDifficulty(tripDTO.getDifficulty());

        if (tripDTO.getGroupId() != null) {
            Group group = groupRepository.findById(tripDTO.getGroupId())
                .orElseThrow(() -> new RuntimeException("Group not found"));
            group.addTrip(trip);
            groupRepository.save(group);
        }

        Trip savedTrip = tripRepository.save(trip);
        return mapToDTO(savedTrip);
    }

    @Override
    public TripDTO getTripById(String id) {
        Trip trip = tripRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Trip not found"));
        return mapToDTO(trip);
    }

    @Override
    public List<TripDTO> getAllTrips() {
        return tripRepository.findAll().stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public void deleteTrip(String id) {
        tripRepository.deleteById(id);
    }

    private TripDTO mapToDTO(Trip trip) {
        TripDTO dto = new TripDTO();
        dto.setId(trip.getId());
        dto.setName(trip.getName());
        dto.setDestination(trip.getDestination());
        dto.setNotes(trip.getNotes());
        dto.setStartDate(trip.getStartDate());
        dto.setEndDate(trip.getEndDate());
        dto.setDifficulty(trip.getDifficulty());
        if (trip.getGroup() != null) {
            dto.setGroupId(trip.getGroup().getId());
        }
        return dto;
    }
}
