package com.campconnect.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.campconnect.model.Season;
import com.campconnect.repository.SeasonRepository;

/**
<<<<<<< HEAD
 * REST Controller pour gérer les opérations CRUD sur les saisons.
=======
 * REST Controller pour gÃƒÂ©rer les opÃƒÂ©rations CRUD sur les saisons.
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
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
<<<<<<< HEAD
     * Récupère toutes les saisons.
=======
     * RÃƒÂ©cupÃƒÂ¨re toutes les saisons.
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
     */
    @GetMapping
    public ResponseEntity<List<Season>> getAllSeasons() {
        List<Season> seasons = seasonRepository.findAll();
        return ResponseEntity.ok(seasons);
    }

    /**
     * GET /api/seasons/{id}
<<<<<<< HEAD
     * Récupère une saison par son identifiant.
=======
     * RÃƒÂ©cupÃƒÂ¨re une saison par son identifiant.
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
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
<<<<<<< HEAD
     * Crée une nouvelle saison.
=======
     * CrÃƒÂ©e une nouvelle saison.
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
     */
    @PostMapping
    public ResponseEntity<Season> createSeason(@RequestBody Season season) {
        Season saved = seasonRepository.save(season);
        return ResponseEntity.ok(saved);
    }

    /**
     * PUT /api/seasons/{id}
<<<<<<< HEAD
     * Met à jour une saison existante.
=======
     * Met ÃƒÂ  jour une saison existante.
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
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
