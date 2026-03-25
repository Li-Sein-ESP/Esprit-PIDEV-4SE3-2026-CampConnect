package com.campconnect.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import com.campconnect.enums.BadgeRarity;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BadgeDTO {
    private String id;
    
    @NotBlank(message = "Badge name is required")
    private String name;
    
    private String description;
    private String icon;
    
    @NotBlank(message = "Category is required")
    private String categoryName;
    
    @NotNull(message = "Rarity is required")
    private BadgeRarity rarity;
    private List<String> requirements;
    private String creatorId;
    private String creatorName;
}
