package com.campconnect.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Document(collection = "seasons")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Season {
    
    @Id
    private String id;
    
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private Double priceModifier; // e.g. 1.5 = +50% during peak season
    private Boolean isOpen;
    private String campsiteId; // linked campsite identifier
}
