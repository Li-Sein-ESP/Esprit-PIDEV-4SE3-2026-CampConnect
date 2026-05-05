package com.campconnect.trip.controller;

import com.campconnect.service.UserDetailsImpl;
import com.campconnect.trip.dto.TripAutomationOverviewResponse;
import com.campconnect.trip.service.TripAutomationOverviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/trips/automation")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
@Tag(name = "Trip automation (backend visibility)", description = "État visible des schedulers : Smart Reschedule, notifications itinéraire, statuts voyage")
@SecurityRequirement(name = "BearerAuth")
public class TripAutomationController {

    private final TripAutomationOverviewService overviewService;

    @GetMapping("/overview")
    @Operation(summary = "Vue agrégée automation trips/transports",
            description = "Retarde transports DELAYED, rappels activités/transports dans l’heure, "
                    + "compteurs de transitions PLANNED→ONGOING et COMPLETED. "
                    + "ADMIN voit tout ; utilisateur connecté voit uniquement ses voyages.")
    public TripAutomationOverviewResponse overview(@AuthenticationPrincipal UserDetailsImpl user) {
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "JWT requis");
        }
        boolean admin = user.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
        return overviewService.buildOverview(admin, user.getId());
    }
}
