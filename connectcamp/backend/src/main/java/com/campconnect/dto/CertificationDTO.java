package com.campconnect.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CertificationDTO {
    private String id;
    
    @NotBlank(message = "Certification name is required")
    private String name;
    
    private String description;
    private List<String> requirements;
    @Positive(message = "Validity period must be positive")
    private int validityPeriod;
    
    private String imageUrl;
    @NotBlank(message = "Issuer is required")
    private String issuer;
    private String creatorId;
    private String creatorName;
    private List<String> requiredCourseIds;
}
