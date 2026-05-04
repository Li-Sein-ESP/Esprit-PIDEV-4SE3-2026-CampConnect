package com.campconnect.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "environmental_rules")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnvironmentalRule {

    @Id
    private String id;

    private String title;
    private String description;
    private String category;
    private String icon;
    private String severity;
    private String region;

    @Builder.Default
    private boolean active = true;
}
