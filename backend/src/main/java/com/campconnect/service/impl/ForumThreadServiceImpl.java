package com.campconnect.service.impl;

import com.campconnect.dto.ForumThreadDTO;
import com.campconnect.model.ForumThread;
import com.campconnect.model.User;
import com.campconnect.repository.ForumThreadRepository;
import com.campconnect.repository.UserRepository;
import com.campconnect.service.ForumThreadService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ForumThreadServiceImpl implements ForumThreadService {

    private final ForumThreadRepository threadRepository;
    private final UserRepository userRepository;

    @Override
    public ForumThreadDTO createThread(ForumThreadDTO threadDTO) {
        ForumThread thread = new ForumThread();
        thread.setTitle(threadDTO.getTitle());
        thread.setDescription(threadDTO.getDescription());
        thread.setCategory(threadDTO.getCategory());
        thread.setTags(threadDTO.getTags());
        
        if (threadDTO.getAuthorId() != null) {
            User author = userRepository.findById(threadDTO.getAuthorId())
                .orElseThrow(() -> new RuntimeException("Author not found"));
            thread.setAuthor(author);
        }

        ForumThread savedThread = threadRepository.save(thread);
        return mapToDTO(savedThread);
    }

    @Override
    public ForumThreadDTO getThreadById(String id) {
        ForumThread thread = threadRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Thread not found"));
        return mapToDTO(thread);
    }

    @Override
    public List<ForumThreadDTO> getAllThreads() {
        return threadRepository.findAll().stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public ForumThreadDTO updateThread(String id, ForumThreadDTO threadDTO) {
        ForumThread thread = threadRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Thread not found"));
        
        thread.setTitle(threadDTO.getTitle());
        thread.setDescription(threadDTO.getDescription());
        thread.setCategory(threadDTO.getCategory());
        thread.setTags(threadDTO.getTags());
        
        return mapToDTO(threadRepository.save(thread));
    }

    @Override
    public void likeThread(String id) {
        ForumThread thread = threadRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Thread not found"));
        thread.setLikes(thread.getLikes() + 1);
        threadRepository.save(thread);
    }

    @Override
    public void incrementViews(String id) {
        ForumThread thread = threadRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Thread not found"));
        thread.setViews(thread.getViews() + 1);
        threadRepository.save(thread);
    }

    private ForumThreadDTO mapToDTO(ForumThread thread) {
        ForumThreadDTO dto = new ForumThreadDTO();
        dto.setId(thread.getId());
        dto.setTitle(thread.getTitle());
        dto.setDescription(thread.getDescription());
        dto.setCategory(thread.getCategory());
        dto.setTags(thread.getTags());
        dto.setCreatedAt(thread.getCreatedAt());
        dto.setLikes(thread.getLikes());
        dto.setViews(thread.getViews());
        if (thread.getAuthor() != null) {
            dto.setAuthorId(thread.getAuthor().getId());
        }
        return dto;
    }
}
