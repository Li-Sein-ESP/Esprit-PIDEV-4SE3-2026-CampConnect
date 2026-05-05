package com.campconnect.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.campconnect.model.Campsite;
import com.campconnect.repository.CampsiteRepository;

/**
 * REST Controller pour gÃƒÂ©rer les opÃƒÂ©rations CRUD sur les campings.
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
     * RÃƒÂ©cupÃƒÂ¨re tous les campings.
     */
    @GetMapping
    public ResponseEntity<List<Campsite>> getAllCampsites() {
        List<Campsite> campsites = campsiteRepository.findAll();
        return ResponseEntity.ok(campsites);
    }

    /**
     * GET /api/campsites/{id}
     * RÃƒÂ©cupÃƒÂ¨re un camping par son identifiant.
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
     * CrÃƒÂ©e un nouveau camping.
     */
    @PostMapping
    public ResponseEntity<Campsite> createCampsite(@RequestBody Campsite campsite) {
        Campsite saved = campsiteRepository.save(campsite);
        return ResponseEntity.ok(saved);
    }

    /**
     * PUT /api/campsites/{id}
     * Met ÃƒÂ  jour un camping existant.
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
            campsite.setStatus(campsiteDetails.getStatus());
            campsite.setLatitude(campsiteDetails.getLatitude());
            campsite.setLongitude(campsiteDetails.getLongitude());
            
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
