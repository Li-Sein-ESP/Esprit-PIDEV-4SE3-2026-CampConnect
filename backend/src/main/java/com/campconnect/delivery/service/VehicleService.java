package com.campconnect.delivery.service;

import com.campconnect.common.PagedResponse;
import com.campconnect.delivery.dto.VehicleRequest;
import com.campconnect.delivery.dto.VehicleResponse;
import com.campconnect.delivery.model.Vehicle;
import com.campconnect.delivery.model.VehicleStatus;
import com.campconnect.delivery.repository.VehicleRepository;
import com.campconnect.exception.ConflictException;
import com.campconnect.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final ModelMapper modelMapper;

    public PagedResponse<VehicleResponse> findAll(VehicleStatus status, Pageable pageable) {
        if (status != null) {
            return PagedResponse.from(
                    vehicleRepository.findByStatusAndDeletedFalse(status, pageable)
                            .map(v -> modelMapper.map(v, VehicleResponse.class)));
        }
        return PagedResponse.from(
                vehicleRepository.findByDeletedFalse(pageable)
                        .map(v -> modelMapper.map(v, VehicleResponse.class)));
    }

    public VehicleResponse findById(String id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .filter(v -> !v.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", id));
        return modelMapper.map(vehicle, VehicleResponse.class);
    }

    @Transactional
    public VehicleResponse create(VehicleRequest request) {
        if (vehicleRepository.existsByPlateNumberAndDeletedFalse(request.getPlateNumber())) {
            throw new ConflictException("Vehicle with plate '" + request.getPlateNumber() + "' already exists");
        }
        Vehicle vehicle = modelMapper.map(request, Vehicle.class);
        vehicle.setDeleted(false);
        if (vehicle.getStatus() == null) {
            vehicle.setStatus(VehicleStatus.AVAILABLE);
        }
        return modelMapper.map(vehicleRepository.save(vehicle), VehicleResponse.class);
    }

    @Transactional
    public VehicleResponse update(String id, VehicleRequest request) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .filter(v -> !v.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", id));

        if (!vehicle.getPlateNumber().equals(request.getPlateNumber())
                && vehicleRepository.existsByPlateNumberAndDeletedFalse(request.getPlateNumber())) {
            throw new ConflictException("Vehicle with plate '" + request.getPlateNumber() + "' already exists");
        }

        modelMapper.map(request, vehicle);
        return modelMapper.map(vehicleRepository.save(vehicle), VehicleResponse.class);
    }

    @Transactional
    public void delete(String id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .filter(v -> !v.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", id));
        vehicle.setDeleted(true);
        vehicleRepository.save(vehicle);
    }
}
