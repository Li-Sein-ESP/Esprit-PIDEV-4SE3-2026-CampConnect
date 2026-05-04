package com.campconnect.gear.controller;

import com.campconnect.gear.dto.GearInventoryRequest;
import com.campconnect.gear.dto.GearInventoryResponse;
import com.campconnect.gear.service.GearInventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
@Tag(name = "Gear Inventory", description = "Warehouse-level inventory management")
public class GearInventoryController {

    private final GearInventoryService gearInventoryService;

    @PostMapping
    @PreAuthorize("hasRole('EQUIPMENT_PROVIDER') or hasRole('ADMIN')")
    @Operation(summary = "Upsert inventory for a gear item in a warehouse")
    public ResponseEntity<GearInventoryResponse> setInventory(@Valid @RequestBody GearInventoryRequest request) {
        return ResponseEntity.ok(gearInventoryService.setInventory(request));
    }

    @GetMapping("/gear/{gearId}")
    @Operation(summary = "Get all inventory entries for a gear item")
    public ResponseEntity<List<GearInventoryResponse>> getByGear(@PathVariable String gearId) {
        return ResponseEntity.ok(gearInventoryService.getInventoryByGear(gearId));
    }

    @GetMapping("/warehouse/{warehouseId}")
    @Operation(summary = "Get all inventory entries for a warehouse")
    public ResponseEntity<List<GearInventoryResponse>> getByWarehouse(@PathVariable String warehouseId) {
        return ResponseEntity.ok(gearInventoryService.getInventoryByWarehouse(warehouseId));
    }

    @GetMapping("/gear/{gearId}/total")
    @Operation(summary = "Get total stock for a gear item across all warehouses")
    public ResponseEntity<Map<String, Integer>> getTotalStock(@PathVariable String gearId) {
        return ResponseEntity.ok(Map.of("totalStock", gearInventoryService.getTotalStock(gearId)));
    }

    @GetMapping("/gear/{gearId}/available-warehouses")
    @Operation(summary = "Get warehouses sorted by distance with sufficient stock")
    public ResponseEntity<List<GearInventoryResponse>> getAvailableWarehouses(
            @PathVariable String gearId,
            @RequestParam double customerLat,
            @RequestParam double customerLng,
            @RequestParam int quantity) {
        return ResponseEntity.ok(gearInventoryService.getAvailableWarehouses(gearId, quantity, customerLat, customerLng));
    }
}
