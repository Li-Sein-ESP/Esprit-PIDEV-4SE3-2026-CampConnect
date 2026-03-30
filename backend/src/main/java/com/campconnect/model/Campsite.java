package com.campconnect.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "campsites")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Campsite {
    
    @Id
    private String id;
    
    private String name;
    private String location;
    private String description;
    private Double price;
    private Double rating;
    private Integer reviewCount;
    private Integer capacity;
    private Boolean available;
    
    @Builder.Default
    private List<String> images = new ArrayList<>();
    
    @Builder.Default
    private List<String> amenities = new ArrayList<>();
}
