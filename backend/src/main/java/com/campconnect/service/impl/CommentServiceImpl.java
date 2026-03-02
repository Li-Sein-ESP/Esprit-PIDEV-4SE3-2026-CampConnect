package com.campconnect.service.impl;

import com.campconnect.dto.CommentDTO;
import com.campconnect.model.Comment;
import com.campconnect.model.Post;
import com.campconnect.model.User;
import com.campconnect.repository.CommentRepository;
import com.campconnect.repository.PostRepository;
import com.campconnect.repository.UserRepository;
import com.campconnect.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    @Override
    public CommentDTO createComment(CommentDTO commentDTO) {
        Comment comment = new Comment();
        comment.setContent(commentDTO.getContent());

        Post post = postRepository.findById(commentDTO.getPostId())
            .orElseThrow(() -> new RuntimeException("Post not found"));
        post.addComment(comment);
        postRepository.save(post);

        User author = userRepository.findById(commentDTO.getAuthorId())
            .orElseThrow(() -> new RuntimeException("Author not found"));
        comment.setAuthor(author);

        Comment savedComment = commentRepository.save(comment);
        return mapToDTO(savedComment);
    }

    @Override
    public CommentDTO getCommentById(String id) {
        Comment comment = commentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Comment not found"));
        return mapToDTO(comment);
    }

    @Override
    public List<CommentDTO> getCommentsByPostId(String postId) {
        return commentRepository.findAll().stream()
            .filter(c -> c.getPost() != null && c.getPost().getId().equals(postId))
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public void deleteComment(String id) {
        commentRepository.deleteById(id);
    }

    private CommentDTO mapToDTO(Comment comment) {
        CommentDTO dto = new CommentDTO();
        dto.setId(comment.getId());
        dto.setContent(comment.getContent());
        dto.setCreatedAt(comment.getCreatedAt());
        if (comment.getPost() != null) {
            dto.setPostId(comment.getPost().getId());
        }
        if (comment.getAuthor() != null) {
            dto.setAuthorId(comment.getAuthor().getId());
        }
        return dto;
    }
}
