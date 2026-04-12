package com.campconnect.service;

import com.campconnect.dto.PostDTO;
import java.util.List;

public interface PostService {
    PostDTO createPost(PostDTO postDTO);
    PostDTO getPostById(String id);
    List<PostDTO> getPostsByThreadId(String threadId);
    PostDTO updatePost(String id, PostDTO postDTO);
    void deletePost(String id);
}
