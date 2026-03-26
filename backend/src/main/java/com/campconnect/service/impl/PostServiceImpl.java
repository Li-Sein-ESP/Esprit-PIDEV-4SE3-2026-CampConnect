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
    private final ForumThreadRepository threadRepository;
    private final UserRepository userRepository;

    @Override
    public PostDTO createPost(PostDTO postDTO) {
        Post post = new Post();
        post.setContent(postDTO.getContent());

        ForumThread thread = threadRepository.findById(postDTO.getThreadId())
            .orElseThrow(() -> new RuntimeException("Thread not found"));
        thread.addPost(post);
        threadRepository.save(thread);

        User author = userRepository.findById(postDTO.getAuthorId())
            .orElseThrow(() -> new RuntimeException("Author not found"));
        post.setAuthor(author);

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
            .filter(p -> p.getThread() != null && p.getThread().getId().equals(threadId))
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
        if (post.getThread() != null) {
            dto.setThreadId(post.getThread().getId());
        }
        if (post.getAuthor() != null) {
            dto.setAuthorId(post.getAuthor().getId());
            dto.setAuthorName(post.getAuthor().getName());
            dto.setAuthorUsername(post.getAuthor().getUsername());
        }
        return dto;
    }
}
