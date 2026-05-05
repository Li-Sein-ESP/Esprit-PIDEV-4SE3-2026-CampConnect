package com.campconnect.controller;

import com.campconnect.dto.PostDTO;
import com.campconnect.dto.StoryGeneratorRequestDTO;
import com.campconnect.dto.StoryGeneratorResponseDTO;
import com.campconnect.service.PostService;
import com.campconnect.service.UserDetailsImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor

public class PostController {

    private final PostService postService;

    /** Identifiant MongoDB — les likes / follows stockent l'id, pas le username ({@link Authentication#getName()}). */
    private static String currentUserId(Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof UserDetailsImpl principal)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Connexion requise");
        }
        return principal.getId();
    }

    @GetMapping
    public ResponseEntity<List<PostDTO>> getAllPosts() {
        return ResponseEntity.ok(postService.getAllPosts());
    }

    @PostMapping
    public ResponseEntity<PostDTO> createPost(@RequestBody PostDTO postDTO) {
        return ResponseEntity.ok(postService.createPost(postDTO));
    }

    @GetMapping("/following")
    public ResponseEntity<List<PostDTO>> getFollowingPosts(Authentication auth) {
        return ResponseEntity.ok(postService.getFollowingPosts(currentUserId(auth)));
    }

    @PostMapping("/story-generator")
    public ResponseEntity<StoryGeneratorResponseDTO> generateStory(@Valid @RequestBody StoryGeneratorRequestDTO request) {
        return ResponseEntity.ok(postService.generateAdventureStory(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostDTO> getPostById(@PathVariable String id) {
        return ResponseEntity.ok(postService.getPostById(id));
    }

    @GetMapping("/thread/{threadId}")
    public ResponseEntity<List<PostDTO>> getPostsByThreadId(@PathVariable String threadId) {
        return ResponseEntity.ok(postService.getPostsByThreadId(threadId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PostDTO> updatePost(@PathVariable String id, @RequestBody PostDTO postDTO) {
        return ResponseEntity.ok(postService.updatePost(id, postDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable String id) {
        postService.deletePost(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/like")
    public ResponseEntity<PostDTO> toggleLike(@PathVariable String id, Authentication auth) {
        return ResponseEntity.ok(postService.toggleLike(id, currentUserId(auth)));
    }
}
