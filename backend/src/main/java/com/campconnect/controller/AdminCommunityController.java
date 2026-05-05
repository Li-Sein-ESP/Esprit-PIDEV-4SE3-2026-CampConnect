package com.campconnect.controller;

import com.campconnect.dto.CommentDTO;
import com.campconnect.dto.PostDTO;
import com.campconnect.model.Comment;
import com.campconnect.model.Post;
import com.campconnect.model.User;
import com.campconnect.repository.CommentRepository;
import com.campconnect.repository.PostRepository;
import com.campconnect.repository.UserRepository;
import com.campconnect.service.CommentService;
import com.campconnect.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/community")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(originPatterns = "*")
public class AdminCommunityController {

    private final PostService postService;
    private final CommentService commentService;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;

    @GetMapping("/posts")
    public ResponseEntity<List<PostDTO>> getAllPostsForModeration() {
        return ResponseEntity.ok(postRepository.findAll().stream().map(this::toPostDTO).toList());
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable String id) {
        postService.deletePost(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/posts/{id}/flag")
    public ResponseEntity<PostDTO> flagPost(@PathVariable String id) {
        PostDTO post = postService.getPostById(id);
        String updatedTitle = post.getTitle() == null ? "[FLAGGED]" : "[FLAGGED] " + post.getTitle();
        post.setTitle(updatedTitle);
        return ResponseEntity.ok(postService.updatePost(id, post));
    }

    @GetMapping("/comments")
    public ResponseEntity<List<CommentDTO>> getAllCommentsForModeration() {
        return ResponseEntity.ok(commentRepository.findAll().stream().map(this::toCommentDTO).toList());
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable String id) {
        commentService.deleteComment(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/users/{id}/ban")
    public ResponseEntity<User> banUser(@PathVariable String id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setVerifiedExpert(false);
        user.setProfileDetails(java.util.Map.of("moderationStatus", "BANNED"));
        return ResponseEntity.ok(userRepository.save(user));
    }

    @PutMapping("/users/{id}/unban")
    public ResponseEntity<User> unbanUser(@PathVariable String id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setProfileDetails(java.util.Map.of("moderationStatus", "ACTIVE"));
        return ResponseEntity.ok(userRepository.save(user));
    }

    private PostDTO toPostDTO(Post post) {
        PostDTO dto = new PostDTO();
        dto.setId(post.getId());
        dto.setThreadId(post.getThreadId());
        dto.setAuthorId(post.getAuthorId());
        dto.setAuthorName(post.getAuthorName());
        dto.setAuthorUsername(post.getAuthorUsername());
        dto.setTitle(post.getTitle());
        dto.setContent(post.getContent());
        dto.setDescription(post.getContent());
        dto.setCategory(post.getCategory());
        dto.setTags(post.getTags());
        dto.setImageUrls(post.getImageUrls());
        dto.setLocation(post.getLocation());
        dto.setCreatedAt(post.getCreatedAt());
        dto.setUpdatedAt(post.getCreatedAt());
        dto.setLikes(0);
        dto.setCommentCount(post.getComments() == null ? 0 : post.getComments().size());
        return dto;
    }

    private CommentDTO toCommentDTO(Comment comment) {
        CommentDTO dto = new CommentDTO();
        dto.setId(comment.getId());
        dto.setContent(comment.getContent());
        dto.setPostId(comment.getPostId());
        dto.setAuthorId(comment.getAuthorId());
        dto.setAuthorName(comment.getAuthorName());
        dto.setAuthorUsername(comment.getAuthorUsername());
        dto.setCreatedAt(comment.getCreatedAt());
        return dto;
    }
}
