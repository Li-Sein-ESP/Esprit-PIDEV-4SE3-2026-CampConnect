package com.campconnect.delivery.service;

import com.campconnect.common.PagedResponse;
import com.campconnect.delivery.dto.FleetScheduleResponse;
import com.campconnect.delivery.dto.VehicleRequest;
import com.campconnect.delivery.dto.VehicleResponse;
import com.campconnect.delivery.model.Vehicle;
import com.campconnect.delivery.model.VehicleStatus;
import com.campconnect.delivery.model.VehicleSchedule;
import com.campconnect.delivery.repository.VehicleRepository;
import com.campconnect.delivery.repository.VehicleScheduleRepository;
import com.campconnect.exception.ConflictException;
import com.campconnect.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final VehicleScheduleRepository scheduleRepository;
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
        // Manual mapping avoids ModelMapper ambiguity (providerId/driverId both end in "Id")
        Vehicle vehicle = new Vehicle();
        vehicle.setPlateNumber(request.getPlateNumber());
        vehicle.setCapacity(request.getCapacity());
        vehicle.setMaxCapacityKg(request.getMaxCapacityKg() > 0 ? request.getMaxCapacityKg() : 100.0);
        vehicle.setVehicleType(request.getVehicleType());
        vehicle.setStatus(request.getStatus() != null ? request.getStatus() : VehicleStatus.AVAILABLE);
        vehicle.setDriverId(request.getDriverId());
        vehicle.setProviderId(request.getProviderId());
        vehicle.setCoverageZones(request.getCoverageZones() != null ? request.getCoverageZones() : new ArrayList<>());
        vehicle.setLatitude(request.getLatitude());
        vehicle.setLongitude(request.getLongitude());
        vehicle.setDeleted(false);
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

        // Manual mapping avoids ModelMapper ambiguity (providerId/driverId both end in "Id")
        vehicle.setPlateNumber(request.getPlateNumber());
        vehicle.setCapacity(request.getCapacity());
        if (request.getMaxCapacityKg() > 0) {
            vehicle.setMaxCapacityKg(request.getMaxCapacityKg());
        }
        if (request.getVehicleType() != null) {
            vehicle.setVehicleType(request.getVehicleType());
        }
        if (request.getStatus() != null) {
            vehicle.setStatus(request.getStatus());
        }
        if (request.getDriverId() != null) {
            vehicle.setDriverId(request.getDriverId());
        }
        if (request.getProviderId() != null) {
            vehicle.setProviderId(request.getProviderId());
        }
        if (request.getCoverageZones() != null) {
            vehicle.setCoverageZones(request.getCoverageZones());
        }
        vehicle.setLatitude(request.getLatitude());
        vehicle.setLongitude(request.getLongitude());

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

    /**
     * Returns fleet weekly schedule for all vehicles owned by the given provider.
     * Each vehicle entry contains a day-by-day capacity breakdown.
     */
    public List<FleetScheduleResponse> getFleetSchedule(String providerId, LocalDate from, LocalDate to) {
        List<Vehicle> vehicles = vehicleRepository.findByProviderIdAndDeletedFalse(providerId);
        if (vehicles.isEmpty()) return List.of();

        List<String> vehicleIds = vehicles.stream().map(Vehicle::getId).collect(Collectors.toList());

        // Fetch all schedules in the date range for these vehicles in one query
        List<VehicleSchedule> allSchedules = new ArrayList<>();
        for (String vid : vehicleIds) {
            allSchedules.addAll(scheduleRepository.findByVehicleIdAndDateBetween(vid, from, to));
        }

        // Index by vehicleId + date string for O(1) lookup
        Map<String, VehicleSchedule> scheduleIndex = allSchedules.stream()
                .collect(Collectors.toMap(
                        s -> s.getVehicleId() + "::" + s.getDate().toString(),
                        s -> s,
                        (a, b) -> a));

        // Build list of all dates in range
        List<LocalDate> dates = new ArrayList<>();
        for (LocalDate d = from; !d.isAfter(to); d = d.plusDays(1)) {
            dates.add(d);
        }

        return vehicles.stream().map(v -> {
            List<FleetScheduleResponse.DaySlot> days = dates.stream().map(date -> {
                VehicleSchedule sched = scheduleIndex.get(v.getId() + "::" + date.toString());
                if (sched == null) {
                    return FleetScheduleResponse.DaySlot.builder()
                            .date(date.toString())
                            .orderCount(0)
                            .usedCapacityKg(0)
                            .capacityPercent(0)
                            .zonesServed(List.of())
                            .deliveryIds(List.of())
                            .build();
                }
                double pct = v.getMaxCapacityKg() > 0
                        ? Math.min(100.0, (sched.getUsedCapacityKg() / v.getMaxCapacityKg()) * 100.0)
                        : 0.0;
                return FleetScheduleResponse.DaySlot.builder()
                        .date(date.toString())
                        .orderCount(sched.getOrderCount())
                        .usedCapacityKg(sched.getUsedCapacityKg())
                        .capacityPercent(pct)
                        .zonesServed(sched.getZonesServed() != null ? sched.getZonesServed() : List.of())
                        .deliveryIds(sched.getDeliveryIds() != null ? sched.getDeliveryIds() : List.of())
                        .build();
            }).collect(Collectors.toList());

            return FleetScheduleResponse.builder()
                    .vehicleId(v.getId())
                    .plateNumber(v.getPlateNumber())
                    .vehicleType(v.getVehicleType())
                    .maxCapacityKg(v.getMaxCapacityKg())
                    .status(v.getStatus() != null ? v.getStatus().name() : null)
                    .days(days)
                    .build();
        }).collect(Collectors.toList());
    }
}
