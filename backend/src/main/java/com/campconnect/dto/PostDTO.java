package com.campconnect.dto;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PostDTO {
    private String id;
    private String threadId;
    private String authorId;
    private String authorName;
    private String authorUsername;
    private String title;
    private String content;
    private String description;
    private String category;
    private List<String> tags;
    private List<String> imageUrls;
    private String location;
    private int likes;
    @com.fasterxml.jackson.annotation.JsonProperty("isLiked")
    private boolean isLiked;
    private int commentCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String moderationStatus;
    private String moderationDecision;
    private Double moderationScore;
    private List<String> moderationReasons;

    // Fallback setters for alternative field names from frontend (for incoming requests)
    @JsonSetter("media")
    public void setMedia(List<String> media) {
        if ((this.imageUrls == null || this.imageUrls.isEmpty()) && media != null && !media.isEmpty()) {
            this.imageUrls = media;
        }
    }

    @JsonSetter("images")
    public void setImages(List<String> images) {
        if ((this.imageUrls == null || this.imageUrls.isEmpty()) && images != null && !images.isEmpty()) {
            this.imageUrls = images;
        }
    }

    // Getter aliases for frontend compatibility (for outgoing responses)
    // These ensure the JSON response includes both 'media' and 'images' fields
    @JsonGetter("media")
    public List<String> getMedia() {
        return this.imageUrls;
    }

    @JsonGetter("images")
    public List<String> getImages() {
        return this.imageUrls;
    }
}
