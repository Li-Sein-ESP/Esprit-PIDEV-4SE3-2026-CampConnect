package com.campconnect.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.campconnect.model.Campsite;
import com.campconnect.repository.CampsiteRepository;

/**
<<<<<<< HEAD
 * REST Controller pour gérer les opérations CRUD sur les campings.
=======
 * REST Controller pour gÃƒÂ©rer les opÃƒÂ©rations CRUD sur les campings.
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
 * Endpoint: /api/campsites
 */
@RestController
@RequestMapping("/api/campsites")
@CrossOrigin(origins = "http://localhost:4200")
public class CampsiteController {

    @Autowired
    private CampsiteRepository campsiteRepository;

    /**
     * GET /api/campsites
<<<<<<< HEAD
     * Récupère tous les campings.
=======
     * RÃƒÂ©cupÃƒÂ¨re tous les campings.
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
     */
    @GetMapping
    public ResponseEntity<List<Campsite>> getAllCampsites() {
        List<Campsite> campsites = campsiteRepository.findAll();
        return ResponseEntity.ok(campsites);
    }

    /**
     * GET /api/campsites/{id}
<<<<<<< HEAD
     * Récupère un camping par son identifiant.
=======
     * RÃƒÂ©cupÃƒÂ¨re un camping par son identifiant.
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
     */
    @GetMapping("/{id}")
    public ResponseEntity<Campsite> getCampsiteById(@PathVariable String id) {
        Optional<Campsite> campsite = campsiteRepository.findById(id);
        if (campsite.isPresent()) {
            return ResponseEntity.ok(campsite.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * POST /api/campsites
<<<<<<< HEAD
     * Crée un nouveau camping.
=======
     * CrÃƒÂ©e un nouveau camping.
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
     */
    @PostMapping
    public ResponseEntity<Campsite> createCampsite(@RequestBody Campsite campsite) {
        Campsite saved = campsiteRepository.save(campsite);
        return ResponseEntity.ok(saved);
    }

    /**
     * PUT /api/campsites/{id}
<<<<<<< HEAD
     * Met à jour un camping existant.
=======
     * Met ÃƒÂ  jour un camping existant.
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
     */
    @PutMapping("/{id}")
    public ResponseEntity<Campsite> updateCampsite(@PathVariable String id, @RequestBody Campsite campsiteDetails) {
        Optional<Campsite> existing = campsiteRepository.findById(id);
        if (existing.isPresent()) {
            Campsite campsite = existing.get();
            campsite.setName(campsiteDetails.getName());
            campsite.setLocation(campsiteDetails.getLocation());
            campsite.setDescription(campsiteDetails.getDescription());
            campsite.setPrice(campsiteDetails.getPrice());
            campsite.setCapacity(campsiteDetails.getCapacity());
            campsite.setRating(campsiteDetails.getRating());
            campsite.setReviewCount(campsiteDetails.getReviewCount());
            campsite.setAmenities(campsiteDetails.getAmenities());
            campsite.setImages(campsiteDetails.getImages());
            campsite.setAvailable(campsiteDetails.getAvailable());
<<<<<<< HEAD
=======
            campsite.setStatus(campsiteDetails.getStatus());
            campsite.setLatitude(campsiteDetails.getLatitude());
            campsite.setLongitude(campsiteDetails.getLongitude());
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
            
            Campsite updated = campsiteRepository.save(campsite);
            return ResponseEntity.ok(updated);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * DELETE /api/campsites/{id}
     * Supprime un camping par son identifiant.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCampsite(@PathVariable String id) {
        if (campsiteRepository.existsById(id)) {
            campsiteRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
