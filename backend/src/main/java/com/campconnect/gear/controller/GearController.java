package com.campconnect.gear.controller;

import com.campconnect.common.PagedResponse;
import com.campconnect.gear.dto.GearAnalyticsResponse;
import com.campconnect.gear.dto.GearRequest;
import com.campconnect.gear.dto.GearResponse;
import com.campconnect.gear.dto.ProviderStatsResponse;
import com.campconnect.gear.model.GearStatus;
import com.campconnect.gear.service.GearService;
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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/gear")
@RequiredArgsConstructor
@Tag(name = "Gear", description = "Gear inventory and marketplace")
public class GearController {

    private final GearService gearService;

    @GetMapping
    @Operation(summary = "List all gear (paginated, filterable by status and category)")
    public ResponseEntity<PagedResponse<GearResponse>> getAll(
            @RequestParam(required = false) GearStatus status,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {

        String[] parts = sort.split(",");
        Sort.Direction dir = parts.length > 1 && parts[1].equalsIgnoreCase("asc")
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        PageRequest pageable = PageRequest.of(page, size, Sort.by(dir, parts[0]));
        return ResponseEntity.ok(gearService.findAll(status, category, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get gear by ID")
    public ResponseEntity<GearResponse> getById(@PathVariable String id) {
        return ResponseEntity.ok(gearService.findById(id));
    }

    @GetMapping("/my-gear")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get all gear belonging to the authenticated provider")
    public ResponseEntity<PagedResponse<GearResponse>> getMyGear(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {

        String[] parts = sort.split(",");
        Sort.Direction dir = parts.length > 1 && parts[1].equalsIgnoreCase("asc")
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        PageRequest pageable = PageRequest.of(page, size, Sort.by(dir, parts[0]));
        return ResponseEntity.ok(gearService.findByOwner(resolveUserId(userDetails), pageable));
    }

    @PostMapping
    @PreAuthorize("hasRole('EQUIPMENT_PROVIDER') or hasRole('ADMIN')")
    @Operation(summary = "Create new gear listing")
    public ResponseEntity<GearResponse> create(
            @Valid @RequestBody GearRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(gearService.create(request, resolveUserId(userDetails)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('EQUIPMENT_PROVIDER') or hasRole('ADMIN')")
    @Operation(summary = "Update gear (owner only)")
    public ResponseEntity<GearResponse> update(
            @PathVariable String id,
            @Valid @RequestBody GearRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(gearService.update(id, request, resolveUserId(userDetails)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('EQUIPMENT_PROVIDER') or hasRole('ADMIN')")
    @Operation(summary = "Soft-delete gear (owner only)")
    public ResponseEntity<Void> delete(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        gearService.softDelete(id, resolveUserId(userDetails));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/images")
    @PreAuthorize("hasRole('EQUIPMENT_PROVIDER') or hasRole('ADMIN')")
    @Operation(summary = "Add image URL to gear")
    public ResponseEntity<GearResponse> addImage(
            @PathVariable String id,
            @RequestParam String imageUrl,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(gearService.addImage(id, imageUrl, resolveUserId(userDetails)));
    }

    @DeleteMapping("/{id}/images/{imageId}")
    @PreAuthorize("hasRole('EQUIPMENT_PROVIDER') or hasRole('ADMIN')")
    @Operation(summary = "Remove an image from gear")
    public ResponseEntity<GearResponse> removeImage(
            @PathVariable String id,
            @PathVariable String imageId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(gearService.removeImage(id, imageId, resolveUserId(userDetails)));
    }

    @GetMapping("/{gearId}/analytics")
    @PreAuthorize("hasRole('EQUIPMENT_PROVIDER') or hasRole('ADMIN')")
    @Operation(summary = "Get analytics for a gear item")
    public ResponseEntity<GearAnalyticsResponse> getGearAnalytics(
            @PathVariable String gearId) {
        return ResponseEntity.ok(gearService.getGearAnalytics(gearId));
    }

    @GetMapping("/provider/stats")
    @PreAuthorize("hasRole('EQUIPMENT_PROVIDER') or hasRole('ADMIN')")
    @Operation(summary = "Get aggregated stats for provider dashboard")
    public ResponseEntity<ProviderStatsResponse> getProviderStats(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(gearService.getProviderStats(resolveUserId(userDetails)));
    }

    private String resolveUserId(UserDetailsImpl userDetails) {
        if (userDetails != null) {
            return userDetails.getId();
        }
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl principal) {
            return principal.getId();
        }
        throw new IllegalStateException("Authenticated user not found");
    }
}
