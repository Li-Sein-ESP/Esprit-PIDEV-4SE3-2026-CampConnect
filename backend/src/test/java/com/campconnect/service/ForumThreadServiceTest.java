package com.campconnect.service;

import com.campconnect.dto.ForumThreadDTO;
import com.campconnect.model.ForumThread;
import com.campconnect.model.User;
import com.campconnect.repository.ForumThreadRepository;
import com.campconnect.repository.PostRepository;
import com.campconnect.repository.UserRepository;
import com.campconnect.service.impl.ForumThreadServiceImpl;
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
public class ForumThreadServiceTest {

    @Mock
    private ForumThreadRepository threadRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PostRepository postRepository;

    @InjectMocks
    private ForumThreadServiceImpl threadService;

    private ForumThread thread;
    private ForumThreadDTO threadDTO;
    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId("u1");
        user.setUsername("testuser");

        thread = new ForumThread();
        thread.setId("t1");
        thread.setTitle("Camping Spots");
        thread.setDescription("Best spots in the mountains.");
        thread.setAuthor(user);

        threadDTO = new ForumThreadDTO();
        threadDTO.setId("t1");
        threadDTO.setTitle("Camping Spots");
        threadDTO.setDescription("Best spots in the mountains.");
        threadDTO.setAuthorId("u1");
    }

    @Test
    void testCreateThread_Success() {
        when(userRepository.findById("u1")).thenReturn(Optional.of(user));
        when(threadRepository.save(any(ForumThread.class))).thenReturn(thread);

        ForumThreadDTO result = threadService.createThread(threadDTO);

        assertNotNull(result);
        assertEquals("Camping Spots", result.getTitle());
        verify(threadRepository, times(1)).save(any(ForumThread.class));
    }

    @Test
    void testGetThreadById_Success() {
        when(threadRepository.findById("t1")).thenReturn(Optional.of(thread));

        ForumThreadDTO result = threadService.getThreadById("t1");

        assertNotNull(result);
        assertEquals("t1", result.getId());
        assertEquals("testuser", result.getAuthorUsername());
    }

    @Test
    void testGetThreadById_NotFound() {
        when(threadRepository.findById("t1")).thenReturn(Optional.empty());

        Exception exception = assertThrows(RuntimeException.class, () -> {
            threadService.getThreadById("t1");
        });

        assertEquals("Thread not found", exception.getMessage());
    }

    @Test
    void testGetAllThreads() {
        when(threadRepository.findAll()).thenReturn(Arrays.asList(thread));

        List<ForumThreadDTO> result = threadService.getAllThreads();

        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
    }

    @Test
    void testUpdateThread() {
        ForumThreadDTO updateDTO = new ForumThreadDTO();
        updateDTO.setTitle("Updated Title");
        updateDTO.setDescription("Updated Desc");

        ForumThread updatedThread = new ForumThread();
        updatedThread.setId("t1");
        updatedThread.setTitle("Updated Title");

        when(threadRepository.findById("t1")).thenReturn(Optional.of(thread));
        when(threadRepository.save(any(ForumThread.class))).thenReturn(updatedThread);

        ForumThreadDTO result = threadService.updateThread("t1", updateDTO);

        assertNotNull(result);
        assertEquals("Updated Title", result.getTitle());
    }

    @Test
    void testDeleteThread() {
        when(threadRepository.existsById("t1")).thenReturn(true);
        doNothing().when(postRepository).deleteByThreadId("t1");
        doNothing().when(threadRepository).deleteById("t1");

        threadService.deleteThread("t1");

        verify(postRepository, times(1)).deleteByThreadId("t1");
        verify(threadRepository, times(1)).deleteById("t1");
    }
}
