package com.campconnect.service;

import com.campconnect.dto.PostDTO;
import com.campconnect.model.ForumThread;
import com.campconnect.model.Post;
import com.campconnect.model.User;
import com.campconnect.repository.ForumThreadRepository;
import com.campconnect.repository.PostRepository;
import com.campconnect.repository.UserRepository;
import com.campconnect.service.impl.PostServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PostServiceTest {

    @Mock
    private PostRepository postRepository;

    @Mock
    private ForumThreadRepository threadRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private PostServiceImpl postService;

    private Post post;
    private PostDTO postDTO;
    private User user;
    private ForumThread thread;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId("u1");
        user.setUsername("testuser");

        thread = new ForumThread();
        thread.setId("t1");
        thread.setTitle("Camping Spots");

        post = new Post();
        post.setId("p1");
        post.setContent("This is a post.");
        post.setAuthor(user);
        post.setThread(thread);

        postDTO = new PostDTO();
        postDTO.setId("p1");
        postDTO.setContent("This is a post.");
        postDTO.setAuthorId("u1");
        postDTO.setThreadId("t1");
    }

    @Test
    void testCreatePost_Success() {
        when(threadRepository.findById("t1")).thenReturn(Optional.of(thread));
        when(userRepository.findById("u1")).thenReturn(Optional.of(user));
        when(postRepository.save(any(Post.class))).thenReturn(post);

        PostDTO result = postService.createPost(postDTO);

        assertNotNull(result);
        assertEquals("This is a post.", result.getContent());
        verify(postRepository, times(1)).save(any(Post.class));
        verify(threadRepository, times(1)).save(thread);
    }

    @Test
    void testCreatePost_AuthorNotFound() {
        when(threadRepository.findById("t1")).thenReturn(Optional.of(thread));
        when(userRepository.findById("u1")).thenReturn(Optional.empty());

        Exception exception = assertThrows(RuntimeException.class, () -> {
            postService.createPost(postDTO);
        });

        assertEquals("Author not found", exception.getMessage());
        verify(postRepository, never()).save(any(Post.class));
    }

    @Test
    void testGetPostById_Success() {
        when(postRepository.findById("p1")).thenReturn(Optional.of(post));

        PostDTO result = postService.getPostById("p1");

        assertNotNull(result);
        assertEquals("p1", result.getId());
        assertEquals("testuser", result.getAuthorUsername());
    }

    @Test
    void testGetPostsByThreadId_Success() {
        when(postRepository.findAll()).thenReturn(Arrays.asList(post));

        List<PostDTO> result = postService.getPostsByThreadId("t1");

        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
        assertEquals("t1", result.get(0).getThreadId());
    }

    @Test
    void testUpdatePost() {
        PostDTO updateDTO = new PostDTO();
        updateDTO.setContent("Updated content.");

        Post updatedPost = new Post();
        updatedPost.setId("p1");
        updatedPost.setContent("Updated content.");
        updatedPost.setAuthor(user);

        when(postRepository.findById("p1")).thenReturn(Optional.of(post));
        when(postRepository.save(any(Post.class))).thenReturn(updatedPost);

        PostDTO result = postService.updatePost("p1", updateDTO);

        assertNotNull(result);
        assertEquals("Updated content.", result.getContent());
    }

    @Test
    void testDeletePost() {
        doNothing().when(postRepository).deleteById("p1");

        postService.deletePost("p1");

        verify(postRepository, times(1)).deleteById("p1");
    }
}
