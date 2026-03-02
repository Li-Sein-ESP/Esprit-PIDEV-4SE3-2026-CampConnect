package com.campconnect.gear.controller;

import com.campconnect.common.PagedResponse;
import com.campconnect.gear.dto.RentalRequest;
import com.campconnect.gear.dto.RentalResponse;
import com.campconnect.gear.model.RentalStatus;
import com.campconnect.gear.service.RentalService;
import com.campconnect.service.UserDetailsImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rentals")
@RequiredArgsConstructor
@Tag(name = "Rentals", description = "Gear rental management")
public class RentalController {

    private final RentalService rentalService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('EQUIPMENT_PROVIDER')")
    @Operation(summary = "List all rentals (Admin or Provider)")
    public ResponseEntity<PagedResponse<RentalResponse>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        String[] parts = sort.split(",");
        Sort.Direction dir = parts.length > 1 && parts[1].equalsIgnoreCase("asc")
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        return ResponseEntity.ok(rentalService.findAll(
                PageRequest.of(page, size, Sort.by(dir, parts[0]))));
    }

    @GetMapping("/my-rentals")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get current user's rentals")
    public ResponseEntity<PagedResponse<RentalResponse>> getMyRentals(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(rentalService.findByRenter(
                userDetails.getId(), PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get rental by ID")
    public ResponseEntity<RentalResponse> getById(@PathVariable String id) {
        return ResponseEntity.ok(rentalService.findById(id));
    }

    @GetMapping("/gear/{gearId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EQUIPMENT_PROVIDER')")
    @Operation(summary = "Get rentals for a specific gear item")
    public ResponseEntity<PagedResponse<RentalResponse>> getByGear(
            @PathVariable String gearId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(rentalService.findByGear(
                gearId, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Create a rental request (concurrency-safe atomic decrement)")
    public ResponseEntity<RentalResponse> create(
            @Valid @RequestBody RentalRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(rentalService.create(request, userDetails.getId()));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update rental status (state-transition validated)")
    public ResponseEntity<RentalResponse> updateStatus(
            @PathVariable String id,
            @RequestParam RentalStatus status) {
        return ResponseEntity.ok(rentalService.updateStatus(id, status));
    }
}
