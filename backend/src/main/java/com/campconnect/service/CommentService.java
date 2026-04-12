package com.campconnect.service;

import com.campconnect.dto.CommentDTO;
import java.util.List;

public interface CommentService {
    CommentDTO createComment(CommentDTO commentDTO);
    CommentDTO getCommentById(String id);
    List<CommentDTO> getCommentsByPostId(String postId);
    void deleteComment(String id);
}
