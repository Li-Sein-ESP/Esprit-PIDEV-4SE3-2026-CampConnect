package com.campconnect.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class StoryGeneratorRequestDTO {

    @NotBlank(message = "content is required")
    @Size(min = 5, max = 1000, message = "content must be between 5 and 1000 characters")
    private String content;

    @Size(max = 120, message = "location must be at most 120 characters")
    private String location;

    @Pattern(regexp = "^(immersive|default)?$", message = "tone must be immersive or default")
    private String tone;

    @Pattern(regexp = "^(short|medium|long)?$", message = "length must be short, medium or long")
    private String length;

    @Pattern(regexp = "^(fr|en)?$", message = "language must be fr or en")
    private String language;
}
