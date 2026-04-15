package com.campconnect.gear.controller;

import com.campconnect.common.PagedResponse;
import com.campconnect.gear.dto.MaintenanceRequest;
import com.campconnect.gear.dto.MaintenanceResponse;
import com.campconnect.gear.service.MaintenanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/maintenance")
@RequiredArgsConstructor
@Tag(name = "Maintenance", description = "Gear maintenance record management")
@PreAuthorize("hasRole('EQUIPMENT_PROVIDER') or hasRole('ADMIN')")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    @GetMapping("/gear/{gearId}")
    @Operation(summary = "List maintenance records for a gear item")
    public ResponseEntity<PagedResponse<MaintenanceResponse>> getByGear(
            @PathVariable String gearId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(maintenanceService.findByGear(
                gearId, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "maintenanceDate"))));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get maintenance record by ID")
    public ResponseEntity<MaintenanceResponse> getById(@PathVariable String id) {
        return ResponseEntity.ok(maintenanceService.findById(id));
    }

    @PostMapping
    @Operation(summary = "Create a maintenance record")
    public ResponseEntity<MaintenanceResponse> create(@Valid @RequestBody MaintenanceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(maintenanceService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a maintenance record")
    public ResponseEntity<MaintenanceResponse> update(
            @PathVariable String id,
            @Valid @RequestBody MaintenanceRequest request) {
        return ResponseEntity.ok(maintenanceService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft-delete a maintenance record")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        maintenanceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
