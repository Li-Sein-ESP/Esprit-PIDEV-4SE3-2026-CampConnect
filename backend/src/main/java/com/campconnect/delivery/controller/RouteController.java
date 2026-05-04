package com.campconnect.delivery.controller;

import com.campconnect.delivery.dto.RouteResponse;
import com.campconnect.delivery.service.RouteService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/routes")
@RequiredArgsConstructor
@Tag(name = "Route Planning")
public class RouteController {

    private final RouteService routeService;

    @GetMapping("/estimate")
    public ResponseEntity<RouteResponse> estimateRoute(
            @RequestParam Double warehouseLat,
            @RequestParam Double warehouseLng,
            @RequestParam Double customerLat,
            @RequestParam Double customerLng) {

        return ResponseEntity.ok(routeService.estimateRoute(warehouseLat, warehouseLng, customerLat, customerLng));
    }
}
