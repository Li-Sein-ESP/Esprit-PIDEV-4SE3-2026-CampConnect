package com.campconnect.academy.service;

import com.campconnect.academy.dto.VideoDTO;
import java.util.List;

public interface IVideoServices {
    List<VideoDTO> getAllVideos();
    VideoDTO getVideoById(String id);
    VideoDTO createVideo(VideoDTO videoDTO);
    VideoDTO updateVideo(String id, VideoDTO videoDTO);
    void deleteVideo(String id);
    List<VideoDTO> getVideosByCategory(String category);
    com.campconnect.dto.CommentDTO addComment(String videoId, com.campconnect.dto.CommentDTO commentDTO);
    VideoDTO toggleHelpful(String videoId);
}
