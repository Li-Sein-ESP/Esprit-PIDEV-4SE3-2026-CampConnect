package com.campconnect.controller;

import com.campconnect.dto.ForumThreadDTO;
import com.campconnect.service.ForumThreadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/threads")
@RequiredArgsConstructor
@CrossOrigin(originPatterns = "*")
public class ForumThreadController {

    private final ForumThreadService threadService;

    /**
     * POST /api/threads - Create a new forum thread
     */
    @PostMapping
    public ResponseEntity<ForumThreadDTO> createThread(@RequestBody ForumThreadDTO threadDTO) {
        ForumThreadDTO created = threadService.createThread(threadDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * GET /api/threads - Get all forum threads
     */
    @GetMapping
    public ResponseEntity<List<ForumThreadDTO>> getAllThreads() {
        return ResponseEntity.ok(threadService.getAllThreads());
    }

    /**
     * GET /api/threads/{id} - Get one thread by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ForumThreadDTO> getThreadById(@PathVariable String id) {
        return ResponseEntity.ok(threadService.getThreadById(id));
    }

    /**
     * PUT /api/threads/{id} - Update an existing thread
     */
    @PutMapping("/{id}")
    public ResponseEntity<ForumThreadDTO> updateThread(@PathVariable String id,
                                                      @RequestBody ForumThreadDTO threadDTO) {
        return ResponseEntity.ok(threadService.updateThread(id, threadDTO));
    }

    /**
     * DELETE /api/threads/{id} - Delete a thread
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteThread(@PathVariable String id) {
        threadService.deleteThread(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * POST /api/threads/{id}/like - Like a thread
     */
    @PostMapping("/{id}/like")
    public ResponseEntity<Void> likeThread(@PathVariable String id) {
        threadService.likeThread(id);
        return ResponseEntity.ok().build();
    }

    /**
     * POST /api/threads/{id}/view - Increment view count for a thread
     */
    @PostMapping("/{id}/view")
    public ResponseEntity<Void> incrementViews(@PathVariable String id) {
        threadService.incrementViews(id);
        return ResponseEntity.ok().build();
    }
}
