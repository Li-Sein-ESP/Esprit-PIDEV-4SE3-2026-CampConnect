package com.campconnect.controller;

import com.campconnect.dto.ForumThreadDTO;
import com.campconnect.dto.PostDTO;
import com.campconnect.dto.CommentDTO;
import com.campconnect.service.ForumService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/forum")
public class ForumController {

    @Autowired
    private ForumService forumService;

    @GetMapping("/threads")
    public List<ForumThreadDTO> getAllThreads() {
        return forumService.getAllThreads();
    }

    @GetMapping("/threads/{id}")
    public ResponseEntity<ForumThreadDTO> getThreadById(@PathVariable String id) {
        ForumThreadDTO thread = forumService.getThreadById(id);
        return thread != null ? ResponseEntity.ok(thread) : ResponseEntity.notFound().build();
    }

    @PostMapping("/threads")
    public ResponseEntity<ForumThreadDTO> createThread(@Valid @RequestBody ForumThreadDTO threadDTO) {
        return ResponseEntity.ok(forumService.createThread(threadDTO));
    }

    @PutMapping("/threads/{id}")
    public ResponseEntity<ForumThreadDTO> updateThread(@PathVariable String id, @Valid @RequestBody ForumThreadDTO threadDTO) {
        ForumThreadDTO updated = forumService.updateThread(id, threadDTO);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/threads/{id}")
    public ResponseEntity<Void> deleteThread(@PathVariable String id) {
        forumService.deleteThread(id);
        return ResponseEntity.noContent().build();
    }

    // Posts
    @GetMapping("/threads/{threadId}/posts")
    public List<PostDTO> getPosts(@PathVariable String threadId) {
        return forumService.getPostsByThread(threadId);
    }

    @PostMapping("/posts")
    public ResponseEntity<PostDTO> createPost(@Valid @RequestBody PostDTO postDTO) {
        return ResponseEntity.ok(forumService.createPost(postDTO));
    }

    @PutMapping("/posts/{id}")
    public ResponseEntity<PostDTO> updatePost(@PathVariable String id, @Valid @RequestBody PostDTO postDTO) {
        PostDTO updated = forumService.updatePost(id, postDTO);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<Void> deletePost(@PathVariable String postId) {
        forumService.deletePost(postId);
        return ResponseEntity.noContent().build();
    }

    // Comments
    @PostMapping("/comments")
    public ResponseEntity<CommentDTO> addComment(@Valid @RequestBody CommentDTO commentDTO) {
        return ResponseEntity.ok(forumService.createComment(commentDTO));
    }

    @PutMapping("/comments/{id}")
    public ResponseEntity<CommentDTO> updateComment(@PathVariable String id, @Valid @RequestBody CommentDTO commentDTO) {
        CommentDTO updated = forumService.updateComment(id, commentDTO);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable String id) {
        forumService.deleteComment(id);
        return ResponseEntity.noContent().build();
    }
}
