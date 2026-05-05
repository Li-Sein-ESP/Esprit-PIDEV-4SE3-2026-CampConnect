package com.campconnect.ml;

import com.campconnect.model.Campsite;
import com.campconnect.repository.CampsiteRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ml")
@CrossOrigin(origins = "*")
public class DemandForecastController {

    private final DemandForecastService demandForecastService;
    private final CampsiteRepository campsiteRepository;

    public DemandForecastController(DemandForecastService demandForecastService, CampsiteRepository campsiteRepository) {
        this.demandForecastService = demandForecastService;
        this.campsiteRepository = campsiteRepository;
    }

    @GetMapping("/demand-forecast")
    public ResponseEntity<DemandForecastResponse> getDemandForecast(
            @RequestParam(defaultValue = "0") int month) {
        
        int targetMonth = month == 0 ? LocalDate.now().getMonthValue() : month;
        
        List<Campsite> allCampsites = campsiteRepository.findAll();
        
        List<CampsiteForecastRequest> requests = allCampsites.stream()
                .map(this::mapToRequest)
                .collect(Collectors.toList());
                
        DemandForecastResponse response = demandForecastService.getForecast(requests, targetMonth);
        return ResponseEntity.ok(response);
    }

    private CampsiteForecastRequest mapToRequest(Campsite campsite) {
        // TODO: enrich Campsite model if needed (e.g. activity, customerType)
        return CampsiteForecastRequest.builder()
                .id(campsite.getId())
                .name(campsite.getName())
                .region(campsite.getLocation() != null ? campsite.getLocation() : "Tabarka")
                .capacity(campsite.getCapacity() != null ? campsite.getCapacity() : 30)
                .pricePerNight(campsite.getPrice() != null ? campsite.getPrice() : 60.0)
                .activity("Randonnée")
                .customerType("Famille")
                .rating(campsite.getRating() != null ? campsite.getRating() : 4.0)
                .build();
    }
}
