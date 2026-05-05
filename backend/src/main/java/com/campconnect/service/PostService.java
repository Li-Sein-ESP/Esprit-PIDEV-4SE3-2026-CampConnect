package com.campconnect.service;

import com.campconnect.dto.PostDTO;
import com.campconnect.dto.StoryGeneratorRequestDTO;
import com.campconnect.dto.StoryGeneratorResponseDTO;
import java.util.List;

public interface PostService {
    PostDTO createPost(PostDTO postDTO);
    List<PostDTO> getAllPosts();
    PostDTO getPostById(String id);
    List<PostDTO> getPostsByThreadId(String threadId);
    PostDTO updatePost(String id, PostDTO postDTO);
    StoryGeneratorResponseDTO generateAdventureStory(StoryGeneratorRequestDTO request);
    void deletePost(String id);
    List<PostDTO> getFollowingPosts(String userId);
    PostDTO toggleLike(String postId, String userId);
}
