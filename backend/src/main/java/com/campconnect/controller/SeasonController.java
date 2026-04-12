package com.campconnect.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.campconnect.model.Season;
import com.campconnect.repository.SeasonRepository;

/**
 * REST Controller pour gérer les opérations CRUD sur les saisons.
 * Endpoint: /api/seasons
 */
@RestController
@RequestMapping("/api/seasons")
@CrossOrigin(origins = "http://localhost:4200")
public class SeasonController {

    @Autowired
    private SeasonRepository seasonRepository;

    /**
     * GET /api/seasons
     * Récupère toutes les saisons.
     */
    @GetMapping
    public ResponseEntity<List<Season>> getAllSeasons() {
        List<Season> seasons = seasonRepository.findAll();
        return ResponseEntity.ok(seasons);
    }

    /**
     * GET /api/seasons/{id}
     * Récupère une saison par son identifiant.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Season> getSeasonById(@PathVariable String id) {
        Optional<Season> season = seasonRepository.findById(id);
        if (season.isPresent()) {
            return ResponseEntity.ok(season.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * POST /api/seasons
     * Crée une nouvelle saison.
     */
    @PostMapping
    public ResponseEntity<Season> createSeason(@RequestBody Season season) {
        Season saved = seasonRepository.save(season);
        return ResponseEntity.ok(saved);
    }

    /**
     * PUT /api/seasons/{id}
     * Met à jour une saison existante.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Season> updateSeason(@PathVariable String id, @RequestBody Season seasonDetails) {
        Optional<Season> existing = seasonRepository.findById(id);
        if (existing.isPresent()) {
            Season season = existing.get();
            season.setName(seasonDetails.getName());
            season.setStartDate(seasonDetails.getStartDate());
            season.setEndDate(seasonDetails.getEndDate());
            season.setPriceModifier(seasonDetails.getPriceModifier());
            season.setIsOpen(seasonDetails.getIsOpen());
            season.setCampsiteId(seasonDetails.getCampsiteId());
            
            Season updated = seasonRepository.save(season);
            return ResponseEntity.ok(updated);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * DELETE /api/seasons/{id}
     * Supprime une saison par son identifiant.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSeason(@PathVariable String id) {
        if (seasonRepository.existsById(id)) {
            seasonRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
