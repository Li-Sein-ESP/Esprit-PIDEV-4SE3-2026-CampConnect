package com.campconnect.controller;

import com.campconnect.dto.PostDTO;
import com.campconnect.dto.StoryGeneratorRequestDTO;
import com.campconnect.dto.StoryGeneratorResponseDTO;
import com.campconnect.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor

public class PostController {

    private final PostService postService;

    @GetMapping
    public ResponseEntity<List<PostDTO>> getAllPosts() {
        return ResponseEntity.ok(postService.getAllPosts());
    }

    @PostMapping
    public ResponseEntity<PostDTO> createPost(@RequestBody PostDTO postDTO) {
        return ResponseEntity.ok(postService.createPost(postDTO));
    }

    @GetMapping("/following")
    public ResponseEntity<List<PostDTO>> getFollowingPosts(org.springframework.security.core.Authentication auth) {
        return ResponseEntity.ok(postService.getFollowingPosts(auth.getName()));
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
    public ResponseEntity<PostDTO> toggleLike(@PathVariable String id, org.springframework.security.core.Authentication auth) {
        return ResponseEntity.ok(postService.toggleLike(id, auth.getName()));
    }
}
