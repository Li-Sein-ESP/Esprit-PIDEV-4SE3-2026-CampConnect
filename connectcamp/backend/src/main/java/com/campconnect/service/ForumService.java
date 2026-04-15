package com.campconnect.service;

import com.campconnect.model.User;

import com.campconnect.dto.ForumThreadDTO;
import com.campconnect.dto.PostDTO;
import com.campconnect.dto.CommentDTO;
import com.campconnect.entity.ForumThread;
import com.campconnect.entity.Post;
import com.campconnect.entity.Comment;
import com.campconnect.enums.ForumStatus;
import com.campconnect.repository.ForumThreadRepository;
import com.campconnect.repository.PostRepository;
import com.campconnect.repository.CommentRepository;
import com.campconnect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ForumService {

    @Autowired
    private ForumThreadRepository threadRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private UserRepository userRepository;

    // Thread Operations
    public List<ForumThreadDTO> getAllThreads() {
        return threadRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ForumThreadDTO getThreadById(String id) {
        return threadRepository.findById(id)
                .map(this::convertToDTO)
                .orElse(null);
    }

    public ForumThreadDTO createThread(ForumThreadDTO threadDTO) {
        ForumThread thread = new ForumThread();
        thread.setTitle(threadDTO.getTitle());
        thread.setStatus(ForumStatus.OPEN);
        thread.setCreatedAt(LocalDateTime.now());
        
        // Handle Traceability: assign creator
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            String username = ((UserDetails)principal).getUsername();
            userRepository.findByUsername(username).ifPresent(thread::setCreator);
        }
        
        return convertToDTO(threadRepository.save(thread));
    }

    public ForumThreadDTO updateThread(String id, ForumThreadDTO threadDTO) {
        return threadRepository.findById(id).map(thread -> {
            thread.setTitle(threadDTO.getTitle());
            thread.setStatus(threadDTO.getStatus());
            return convertToDTO(threadRepository.save(thread));
        }).orElse(null);
    }

    public void deleteThread(String id) {
        // Cascade: delete all posts and comments first
        threadRepository.findById(id).ifPresent(thread -> {
            List<Post> posts = postRepository.findByThread(thread);
            for (Post post : posts) {
                deletePost(post.getId());
            }
            threadRepository.deleteById(id);
        });
    }

    // Post Operations
    public List<PostDTO> getPostsByThread(String threadId) {
        return threadRepository.findById(threadId).map(thread -> 
            postRepository.findByThread(thread).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList())
        ).orElse(java.util.Collections.emptyList());
    }

    public PostDTO createPost(PostDTO postDTO) {
        Post post = new Post();
        
        threadRepository.findById(postDTO.getThreadId())
            .ifPresent(post::setThread);
            
        post.setContent(postDTO.getContent());
        post.setCreatedAt(LocalDateTime.now());
        
        // Handle Traceability: assign author
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            String username = ((UserDetails)principal).getUsername();
            userRepository.findByUsername(username).ifPresent(post::setAuthor);
        }
        
        return convertToDTO(postRepository.save(post));
    }

    public PostDTO updatePost(String id, PostDTO postDTO) {
        return postRepository.findById(id).map(post -> {
            post.setContent(postDTO.getContent());
            return convertToDTO(postRepository.save(post));
        }).orElse(null);
    }

    public void deletePost(String postId) {
        postRepository.findById(postId).ifPresent(post -> {
            commentRepository.deleteByPost(post);
            postRepository.deleteById(postId);
        });
    }

    // Comment Operations
    public CommentDTO createComment(CommentDTO commentDTO) {
        Comment comment = new Comment();
        
        postRepository.findById(commentDTO.getPostId())
            .ifPresent(comment::setPost);
            
        comment.setContent(commentDTO.getContent());
        comment.setCreatedAt(LocalDateTime.now());
        
        // Handle Traceability: assign author
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            String username = ((UserDetails)principal).getUsername();
            userRepository.findByUsername(username).ifPresent(comment::setAuthor);
        }
        
        return convertToDTO(commentRepository.save(comment));
    }

    public CommentDTO updateComment(String id, CommentDTO commentDTO) {
        return commentRepository.findById(id).map(comment -> {
            comment.setContent(commentDTO.getContent());
            return convertToDTO(commentRepository.save(comment));
        }).orElse(null);
    }

    public void deleteComment(String commentId) {
        commentRepository.deleteById(commentId);
    }

    private ForumThreadDTO convertToDTO(ForumThread thread) {
        return new ForumThreadDTO(thread.getId(), thread.getTitle(), thread.getStatus(), thread.getCreatedAt(), null, null);
    }

    private PostDTO convertToDTO(Post post) {
        PostDTO dto = new PostDTO();
        dto.setId(post.getId());
        dto.setContent(post.getContent());
        dto.setUpvotes(post.getUpvotes());
        dto.setCreatedAt(post.getCreatedAt());
        
        if (post.getThread() != null) {
            dto.setThreadId(post.getThread().getId());
        }
        
        if (post.getAuthor() != null) {
            dto.setAuthorId(post.getAuthor().getId());
            dto.setAuthorName(post.getAuthor().getName());
        }
        return dto;
    }

    private CommentDTO convertToDTO(Comment comment) {
        CommentDTO dto = new CommentDTO();
        dto.setId(comment.getId());
        dto.setContent(comment.getContent());
        dto.setUpvotes(comment.getUpvotes());
        dto.setCreatedAt(comment.getCreatedAt());
        
        if (comment.getPost() != null) {
            dto.setPostId(comment.getPost().getId());
        }
        
        if (comment.getAuthor() != null) {
            dto.setAuthorId(comment.getAuthor().getId());
            dto.setAuthorName(comment.getAuthor().getName());
        }
        return dto;
    }
}
