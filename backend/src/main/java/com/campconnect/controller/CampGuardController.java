package com.campconnect.controller;

import com.campconnect.dto.AtRiskUserDto;
import com.campconnect.dto.CampGuardKpiDto;
import com.campconnect.dto.TriggerActionsResponseDto;
import com.campconnect.service.CampGuardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/churn")
@RequiredArgsConstructor
@CrossOrigin(originPatterns = "*")
@PreAuthorize("hasRole('ADMIN')")
public class CampGuardController {

    private final CampGuardService campGuardService;

    @GetMapping("/at-risk-users")
    public ResponseEntity<List<AtRiskUserDto>> getAtRiskUsers(
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(campGuardService.getAtRiskUsers(level, search));
    }

    @PostMapping("/trigger-actions")
    public ResponseEntity<TriggerActionsResponseDto> triggerActions() {
        return ResponseEntity.ok(campGuardService.triggerActions());
    }

    @GetMapping("/kpis")
    public ResponseEntity<CampGuardKpiDto> getKpis() {
        return ResponseEntity.ok(campGuardService.getKpis());
    }
}
