package com.campconnect.gear.service;

import com.campconnect.common.PagedResponse;
import com.campconnect.exception.ResourceNotFoundException;
import com.campconnect.gear.dto.MaintenanceRequest;
import com.campconnect.gear.dto.MaintenanceResponse;
import com.campconnect.gear.model.MaintenanceRecord;
import com.campconnect.gear.repository.GearRepository;
import com.campconnect.gear.repository.MaintenanceRecordRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MaintenanceService {

    private final MaintenanceRecordRepository maintenanceRecordRepository;
    private final GearRepository gearRepository;
    private final ModelMapper modelMapper;

    public PagedResponse<MaintenanceResponse> findByGear(String gearId, Pageable pageable) {
        // Verify gear exists
        gearRepository.findById(gearId)
                .filter(g -> !g.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Gear", "id", gearId));

        return PagedResponse.from(
                maintenanceRecordRepository.findByGearIdAndDeletedFalse(gearId, pageable)
                        .map(r -> modelMapper.map(r, MaintenanceResponse.class)));
    }

    public MaintenanceResponse findById(String id) {
        MaintenanceRecord record = maintenanceRecordRepository.findById(id)
                .filter(r -> !r.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("MaintenanceRecord", "id", id));
        return modelMapper.map(record, MaintenanceResponse.class);
    }

    @Transactional
    public MaintenanceResponse create(MaintenanceRequest request) {
        gearRepository.findById(request.getGearId())
                .filter(g -> !g.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Gear", "id", request.getGearId()));

        MaintenanceRecord record = modelMapper.map(request, MaintenanceRecord.class);
        record.setDeleted(false);
        return modelMapper.map(maintenanceRecordRepository.save(record), MaintenanceResponse.class);
    }

    @Transactional
    public MaintenanceResponse update(String id, MaintenanceRequest request) {
        MaintenanceRecord record = maintenanceRecordRepository.findById(id)
                .filter(r -> !r.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("MaintenanceRecord", "id", id));
        modelMapper.map(request, record);
        return modelMapper.map(maintenanceRecordRepository.save(record), MaintenanceResponse.class);
    }

    @Transactional
    public void delete(String id) {
        MaintenanceRecord record = maintenanceRecordRepository.findById(id)
                .filter(r -> !r.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("MaintenanceRecord", "id", id));
        record.setDeleted(true);
        maintenanceRecordRepository.save(record);
    }
}
