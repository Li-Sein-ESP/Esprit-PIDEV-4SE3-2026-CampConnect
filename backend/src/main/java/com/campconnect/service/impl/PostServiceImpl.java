package com.campconnect.service.impl;

import com.campconnect.dto.PostDTO;
import com.campconnect.model.ForumThread;
import com.campconnect.model.Post;
import com.campconnect.model.User;
import com.campconnect.repository.ForumThreadRepository;
import com.campconnect.repository.PostRepository;
import com.campconnect.repository.UserRepository;
import com.campconnect.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;

    @Override
    public PostDTO createPost(PostDTO postDTO) {
        Post post = new Post();
        // Fallback for content/description mismatch
        post.setContent(postDTO.getContent() != null ? postDTO.getContent() : postDTO.getDescription());

        // Use manual string references instead of DBRef
        post.setThreadId(postDTO.getThreadId());
        post.setAuthorId(postDTO.getAuthorId());
        post.setAuthorName(postDTO.getAuthorName() != null ? postDTO.getAuthorName() : "Explorer");
        post.setAuthorUsername(postDTO.getAuthorUsername() != null ? postDTO.getAuthorUsername() : "explorer");

        Post savedPost = postRepository.save(post);
        return mapToDTO(savedPost);
    }

    @Override
    public PostDTO getPostById(String id) {
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Post not found"));
        return mapToDTO(post);
    }

    @Override
    public List<PostDTO> getPostsByThreadId(String threadId) {
        return postRepository.findAll().stream()
            .filter(p -> p.getThreadId() != null && p.getThreadId().equals(threadId))
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public PostDTO updatePost(String id, PostDTO postDTO) {
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Post not found"));
        post.setContent(postDTO.getContent());
        return mapToDTO(postRepository.save(post));
    }

    @Override
    public void deletePost(String id) {
        postRepository.deleteById(id);
    }

    private PostDTO mapToDTO(Post post) {
        PostDTO dto = new PostDTO();
        dto.setId(post.getId());
        dto.setContent(post.getContent());
        dto.setCreatedAt(post.getCreatedAt());
        dto.setThreadId(post.getThreadId());
        dto.setAuthorId(post.getAuthorId());
        dto.setAuthorName(post.getAuthorName());
        dto.setAuthorUsername(post.getAuthorUsername());
        return dto;
    }
}
