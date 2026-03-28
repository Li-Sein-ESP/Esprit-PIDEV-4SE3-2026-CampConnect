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
        comment.setPostId(commentDTO.getPostId());
        comment.setAuthorId(commentDTO.getAuthorId());
        comment.setAuthorName(commentDTO.getAuthorName() != null ? commentDTO.getAuthorName() : "Explorer");
        comment.setAuthorUsername(commentDTO.getAuthorUsername() != null ? commentDTO.getAuthorUsername() : "explorer");

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
            .filter(c -> c.getPostId() != null && c.getPostId().equals(postId))
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
        dto.setPostId(comment.getPostId());
        dto.setAuthorId(comment.getAuthorId());
        dto.setAuthorName(comment.getAuthorName());
        dto.setAuthorUsername(comment.getAuthorUsername());
        return dto;
    }
}
