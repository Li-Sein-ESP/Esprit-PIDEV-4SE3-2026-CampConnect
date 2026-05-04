package com.campconnect.dto;

<<<<<<< HEAD
import lombok.AllArgsConstructor;
=======
import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.JsonInclude;
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
<<<<<<< HEAD
@AllArgsConstructor
=======
@JsonInclude(JsonInclude.Include.NON_NULL)
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
public class PostDTO {
    private String id;
    private String threadId;
    private String authorId;
    private String authorName;
    private String authorUsername;
    private String title;
    private String content;
    private String description;
<<<<<<< HEAD
    private List<String> imageUrls;
=======
    private String category;
    private List<String> tags;
    private List<String> imageUrls;
    private String location;
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
    private int likes;
    private int commentCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
<<<<<<< HEAD
=======

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
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
}
