package com.campconnect.delivery.service;

import com.campconnect.delivery.dto.WarehouseRequest;
import com.campconnect.delivery.dto.WarehouseResponse;
import com.campconnect.delivery.model.Warehouse;
import com.campconnect.delivery.repository.WarehouseRepository;
import com.campconnect.exception.BadRequestException;
import com.campconnect.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WarehouseService {

    private final WarehouseRepository warehouseRepository;
    private final ModelMapper modelMapper;

    @Transactional
    public WarehouseResponse create(WarehouseRequest request, String providerId) {
        Warehouse warehouse = modelMapper.map(request, Warehouse.class);
        warehouse.setProviderId(providerId);
        warehouse.setDeleted(false);
        return toResponse(warehouseRepository.save(warehouse));
    }

    public List<WarehouseResponse> findByProvider(String providerId) {
        return warehouseRepository.findByProviderIdAndDeletedFalse(providerId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public WarehouseResponse findById(String id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .filter(w -> !w.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", "id", id));
        return toResponse(warehouse);
    }

    @Transactional
    public WarehouseResponse update(String id, WarehouseRequest request, String providerId) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .filter(w -> !w.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", "id", id));

        if (!warehouse.getProviderId().equals(providerId)) {
            throw new BadRequestException("You are not allowed to modify this warehouse.");
        }

        warehouse.setName(request.getName());
        warehouse.setAddress(request.getAddress());
        warehouse.setLatitude(request.getLatitude());
        warehouse.setLongitude(request.getLongitude());
        if (request.getZone() != null) {
            warehouse.setZone(request.getZone());
        }

        return toResponse(warehouseRepository.save(warehouse));
    }

    @Transactional
    public void delete(String id, String providerId) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .filter(w -> !w.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", "id", id));

        if (!warehouse.getProviderId().equals(providerId)) {
            throw new BadRequestException("You are not allowed to delete this warehouse.");
        }

        warehouse.setDeleted(true);
        warehouseRepository.save(warehouse);
    }

    public Warehouse getEntityById(String id) {
        return warehouseRepository.findById(id)
                .filter(w -> !w.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", "id", id));
    }

    private WarehouseResponse toResponse(Warehouse warehouse) {
        WarehouseResponse response = modelMapper.map(warehouse, WarehouseResponse.class);
        response.setCreatedAt(warehouse.getCreatedAt() != null ? warehouse.getCreatedAt().toString() : null);
        return response;
    }
}
