package com.campconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StoryGeneratorResponseDTO {
    private String story;
    private String sourceContent;
    private boolean mocked;
    private String provider;
}
