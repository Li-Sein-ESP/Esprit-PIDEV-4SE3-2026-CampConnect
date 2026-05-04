package com.campconnect.predict.ml;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ml")
@CrossOrigin(origins = "*")
public class DemandPredictionController {

    private final DemandPredictionService predictionService;

    public DemandPredictionController(DemandPredictionService predictionService) {
        this.predictionService = predictionService;
    }

    @PostMapping("/predict-demand")
    public ResponseEntity<DemandPredictionResponse> predictDemand(
        @RequestBody DemandPredictionRequest request
    ) {
        DemandPredictionResponse result = predictionService.predictDemand(request);
        return ResponseEntity.ok(result);
    }
}
