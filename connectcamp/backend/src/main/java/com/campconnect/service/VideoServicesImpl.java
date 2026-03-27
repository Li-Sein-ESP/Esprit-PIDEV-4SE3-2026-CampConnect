package com.campconnect.service;

import com.campconnect.dto.VideoDTO;
import com.campconnect.dto.UserSummaryDTO;
import com.campconnect.entity.Video;
import com.campconnect.entity.Comment;
import com.campconnect.dto.CommentDTO;
import com.campconnect.repository.VideoRepository;
import com.campconnect.repository.UserRepository;
import com.campconnect.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VideoServicesImpl implements IVideoServices {

    @Autowired
    private VideoRepository videoRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Override
    public List<VideoDTO> getAllVideos() {
        return videoRepository.findAll().stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public VideoDTO getVideoById(String id) {
        return videoRepository.findById(id).map(this::convertToDTO).orElse(null);
    }

    @Override
    public VideoDTO createVideo(VideoDTO videoDTO) {
        Video video = convertToEntity(videoDTO);
        video.setCreatedAt(LocalDateTime.now());
        video.setViews(0);
        video.setHelpfulCount(0);
        return convertToDTO(videoRepository.save(video));
    }

    @Override
    public VideoDTO updateVideo(String id, VideoDTO videoDTO) {
        if (!videoRepository.existsById(id)) return null;
        Video video = convertToEntity(videoDTO);
        video.setId(id);
        return convertToDTO(videoRepository.save(video));
    }

    @Override
    public void deleteVideo(String id) {
        videoRepository.deleteById(id);
    }

    @Override
    public List<VideoDTO> getVideosByCategory(String category) {
        return videoRepository.findByCategory(category).stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public CommentDTO addComment(String videoId, CommentDTO commentDTO) {
        Video video = videoRepository.findById(videoId).orElseThrow(() -> new RuntimeException("Video not found"));
        
        Comment comment = new Comment();
        comment.setContent(commentDTO.getContent());
        comment.setCreatedAt(LocalDateTime.now());
        comment.setUpvotes(0);
        
        // Handle Author
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof org.springframework.security.core.userdetails.UserDetails) {
            String currentUsername = ((org.springframework.security.core.userdetails.UserDetails)auth.getPrincipal()).getUsername();
            userRepository.findByUsername(currentUsername).ifPresent(comment::setAuthor);
        } else if (commentDTO.getAuthorId() != null) {
            userRepository.findById(commentDTO.getAuthorId()).ifPresent(comment::setAuthor);
        }
        
        // Save the comment
        Comment savedComment = commentRepository.save(comment);
        
        // Add to video and save video
        video.getComments().add(savedComment);
        videoRepository.save(video);
        
        return convertCommentToDTO(savedComment);
    }

    @Override
    public VideoDTO toggleHelpful(String videoId) {
        Video video = videoRepository.findById(videoId).orElseThrow(() -> new RuntimeException("Video not found"));
        // Simplistic approach: just increment for now (the UI toggles local state but no tracking per user is specified yet in Video model)
        video.setHelpfulCount(video.getHelpfulCount() + 1);
        return convertToDTO(videoRepository.save(video));
    }

    private VideoDTO convertToDTO(Video video) {
        VideoDTO dto = new VideoDTO();
        dto.setId(video.getId());
        dto.setTitle(video.getTitle());
        dto.setDescription(video.getDescription());
        dto.setVideoUrl(video.getVideoUrl());
        dto.setThumbnailUrl(video.getThumbnailUrl());
        dto.setCategory(video.getCategory());
        dto.setType(video.getType());
        dto.setViews(video.getViews());
        dto.setHelpfulCount(video.getHelpfulCount());
        dto.setCreatedAt(video.getCreatedAt());
        dto.setTakeaways(video.getTakeaways());
        
        if (video.getCreator() != null) {
            UserSummaryDTO creatorDto = new UserSummaryDTO();
            creatorDto.setId(video.getCreator().getId());
            creatorDto.setUsername(video.getCreator().getUsername());
            creatorDto.setName(video.getCreator().getName());
            creatorDto.setVerifiedExpert(video.getCreator().isVerifiedExpert());
            dto.setCreator(creatorDto);
        }
        
        if (video.getComments() != null) {
            dto.setComments(video.getComments().stream().map(this::convertCommentToDTO).collect(Collectors.toList()));
        }
        
        return dto;
    }

    private CommentDTO convertCommentToDTO(Comment comment) {
        CommentDTO dto = new CommentDTO();
        dto.setId(comment.getId());
        dto.setContent(comment.getContent());
        dto.setUpvotes(comment.getUpvotes());
        dto.setCreatedAt(comment.getCreatedAt());
        
        if (comment.getAuthor() != null) {
            dto.setAuthorId(comment.getAuthor().getId());
            dto.setAuthorName(comment.getAuthor().getName());
        } else {
            dto.setAuthorName("Anonymous");
        }
        
        return dto;
    }

    private Video convertToEntity(VideoDTO dto) {
        Video video = new Video();
        video.setTitle(dto.getTitle());
        video.setDescription(dto.getDescription());
        video.setVideoUrl(dto.getVideoUrl());
        video.setThumbnailUrl(dto.getThumbnailUrl());
        video.setCategory(dto.getCategory());
        video.setType(dto.getType());
        video.setTakeaways(dto.getTakeaways());
        
        if (dto.getCreator() != null) {
            String creatorId = dto.getCreator().getId();
            String username = dto.getCreator().getUsername();
            
            // Try ID first, but ONLY if it's not the "admin" placeholder
            if (creatorId != null && !creatorId.equals("admin")) {
                userRepository.findById(creatorId).ifPresent(video::setCreator);
            }
            
            // Fallback to username from DTO if creator still not found
            if (video.getCreator() == null && username != null) {
                userRepository.findByUsername(username).ifPresent(video::setCreator);
            }
        }
        
        // Handle Traceability: assign creator safely from SecurityContext if still null
        if (video.getCreator() == null) {
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof org.springframework.security.core.userdetails.UserDetails) {
                String currentUsername = ((org.springframework.security.core.userdetails.UserDetails)auth.getPrincipal()).getUsername();
                userRepository.findByUsername(currentUsername).ifPresent(video::setCreator);
            }
        }
        
        // Fallback for admin if still not set
        if (video.getCreator() == null) {
            userRepository.findByUsername("admin").ifPresent(video::setCreator);
        }
        
        return video;
    }
}
