package com.campconnect.controller;

import com.campconnect.dto.ForumThreadDTO;
import com.campconnect.service.ForumThreadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;

@RestController
@RequestMapping("/api/threads")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class ForumThreadController {

    private final ForumThreadService threadService;

    @PostMapping
    public ResponseEntity<ForumThreadDTO> createThread(@RequestBody ForumThreadDTO threadDTO) {
        return ResponseEntity.ok(threadService.createThread(threadDTO));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ForumThreadDTO> getThreadById(@PathVariable String id) {
        return ResponseEntity.ok(threadService.getThreadById(id));
    }

    @GetMapping
    public ResponseEntity<List<ForumThreadDTO>> getAllThreads() {
        return ResponseEntity.ok(threadService.getAllThreads());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ForumThreadDTO> updateThread(@PathVariable String id, @RequestBody ForumThreadDTO threadDTO) {
        return ResponseEntity.ok(threadService.updateThread(id, threadDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteThread(@PathVariable String id) {
        threadService.deleteThread(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/like")
    public ResponseEntity<Void> likeThread(@PathVariable String id) {
        threadService.likeThread(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/view")
    public ResponseEntity<Void> incrementViews(@PathVariable String id) {
        threadService.incrementViews(id);
        return ResponseEntity.ok().build();
    }
}
