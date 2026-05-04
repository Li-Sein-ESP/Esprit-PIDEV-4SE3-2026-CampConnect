package com.campconnect.service;

import com.campconnect.dto.PostDTO;
import java.util.List;

public interface PostService {
    PostDTO createPost(PostDTO postDTO);
<<<<<<< HEAD
=======
    List<PostDTO> getAllPosts();
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
    PostDTO getPostById(String id);
    List<PostDTO> getPostsByThreadId(String threadId);
    PostDTO updatePost(String id, PostDTO postDTO);
    void deletePost(String id);
}
