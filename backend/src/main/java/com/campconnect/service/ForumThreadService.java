package com.campconnect.service;

import com.campconnect.dto.ForumThreadDTO;
import java.util.List;

public interface ForumThreadService {
    ForumThreadDTO createThread(ForumThreadDTO threadDTO);
    ForumThreadDTO getThreadById(String id);
    List<ForumThreadDTO> getAllThreads();
    ForumThreadDTO updateThread(String id, ForumThreadDTO threadDTO);
    void deleteThread(String id);
    void likeThread(String id);
    void incrementViews(String id);
}
