package com.campconnect.entity;

import com.campconnect.model.User;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.NotEmpty;

@Document(collection = "certifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Certification {
    @Id
    private String id;
    
    @NotBlank(message = "Name is required")
    private String name;
    
    @NotBlank(message = "Description is required")
    private String description;
    
    private List<String> requirements;
    
    @Positive(message = "Validity period must be positive")
    private int validityPeriod; // in months
    
    private String imageUrl;
    
    @NotBlank(message = "Issuer is required")
    private String issuer;

    @DBRef
    private User creator;

    @DBRef
    private List<Course> requiredCourses;
}
