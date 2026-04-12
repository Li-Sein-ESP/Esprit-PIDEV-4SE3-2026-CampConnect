package com.campconnect.academy.entity;
import com.campconnect.model.Category;

import com.campconnect.model.User;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.campconnect.enums.BadgeRarity;
import org.springframework.data.mongodb.core.mapping.DBRef;
import java.util.List;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Document(collection = "badges")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Badge {
    @Id
    private String id;
    
    @NotBlank(message = "Name is required")
    private String name;
    
    @NotBlank(message = "Description is required")
    private String description;
    
    @NotBlank(message = "Icon is required")
    private String icon;

    @DBRef
    private Category category;

    private String rarity;
    private List<String> requirements;

    @DBRef
    private User creator;
}
